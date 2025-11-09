// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PaymentSplitterYieldAdapter
 * @author Kinetic Protocol
 * @notice Morpho Vault V2 adapter that routes 100% of yield to PaymentSplitter for public goods funding
 *
 * MORPHO VAULTS V2 INTEGRATION:
 * =============================
 * This adapter implements the IAdapter interface required by Morpho Vaults V2,
 * enabling programmatic yield allocation to public goods via PaymentSplitter.
 *
 * ARCHITECTURE:
 * - Allocates assets to underlying ERC-4626 vaults (Aave, etc.)
 * - Tracks principal vs. yield using high-watermark accounting
 * - Routes 100% of realized yield → PaymentSplitter → Public goods recipients
 * - Maintains non-custodial guarantees (principal always withdrawable)
 *
 * ROLE MODEL COMPLIANCE:
 * - Only callable by parent Morpho Vault V2
 * - Respects Curator-configured caps via market IDs
 * - Supports Allocator-triggered reallocations
 * - Enables Sentinel emergency deallocations
 */
contract PaymentSplitterYieldAdapter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotAuthorized();
    error InvalidVault();
    error InvalidMarket();
    error SlippageTooHigh();
    error InsufficientAllocation();
    error AssetMismatch();

    /// @notice Parent Morpho Vault V2 that controls this adapter
    address public immutable parentVault;

    /// @notice Underlying asset (e.g., USDC, DAI)
    address public immutable asset;

    /// @notice PaymentSplitter receiving all yield
    address public immutable paymentSplitter;

    /// @notice Unique adapter ID for Morpho tracking
    bytes32 public immutable adapterId;

    /// @dev Struct to track allocation to a specific market/vault
    struct MarketAllocation {
        address vault; // ERC-4626 vault address
        uint256 principalDeposited; // Original deposit (high-watermark)
        uint256 totalShares; // Vault shares owned
        uint256 lastYieldHarvest; // Timestamp of last yield harvest
    }

    /// @notice Mapping: market ID => allocation details
    mapping(bytes32 => MarketAllocation) public allocations;

    /// @notice Active market IDs (for realAssets calculation)
    bytes32[] public marketIds;

    /// @notice Total principal across all markets
    uint256 public totalPrincipal;

    /// @notice Total yield donated to PaymentSplitter
    uint256 public totalYieldDonated;

    event Allocated(bytes32 indexed marketId, address indexed vault, uint256 assets, uint256 shares);
    event Deallocated(bytes32 indexed marketId, address indexed vault, uint256 assets, uint256 shares);
    event YieldHarvested(bytes32 indexed marketId, uint256 yieldAmount, uint256 totalDonated);
    event MarketAdded(bytes32 indexed marketId, address indexed vault);
    event MarketRemoved(bytes32 indexed marketId);

    /**
     * @notice Initialize adapter for Morpho Vault V2
     * @param _parentVault Morpho Vault V2 address
     * @param _paymentSplitter PaymentSplitter address for yield routing
     */
    constructor(address _parentVault, address _paymentSplitter) {
        if (_parentVault == address(0)) revert InvalidVault();
        if (_paymentSplitter == address(0)) revert InvalidVault();

        parentVault = _parentVault;
        paymentSplitter = _paymentSplitter;

        // Get asset from parent vault (assumes ERC-4626 interface)
        asset = IERC4626(_parentVault).asset();

        // Generate unique adapter ID
        adapterId = keccak256(abi.encode("kinetic/payment-splitter", address(this)));

        // Approve PaymentSplitter to receive yield
        IERC20(asset).safeApprove(_paymentSplitter, type(uint256).max);
    }

    /**
     * @notice Allocate assets to an underlying market (ERC-4626 vault)
     * @param data ABI-encoded (address vault, bytes32 marketId)
     * @param assets Amount of assets to allocate
     * @param selector Function selector (unused, for Morpho compatibility)
     * @param sender Original caller (unused, for Morpho compatibility)
     * @return ids Array of affected market IDs
     * @return change Change in allocation for this market
     *
     * @dev Only callable by parent Morpho Vault V2
     * @dev Deposits assets into ERC-4626 vault and tracks as principal
     */
    function allocate(bytes memory data, uint256 assets, bytes4 selector, address sender)
        external
        nonReentrant
        returns (bytes32[] memory ids, int256 change)
    {
        if (msg.sender != parentVault) revert NotAuthorized();

        (address vault, bytes32 marketId) = abi.decode(data, (address, bytes32));
        if (vault == address(0)) revert InvalidVault();
        if (IERC4626(vault).asset() != asset) revert AssetMismatch();

        // Harvest any existing yield before allocating more
        if (allocations[marketId].vault != address(0)) {
            _harvestYield(marketId);
        }

        // Transfer assets from parent vault
        IERC20(asset).safeTransferFrom(parentVault, address(this), assets);

        // Approve and deposit into underlying vault
        IERC20(asset).safeApprove(vault, assets);
        uint256 shares = IERC4626(vault).deposit(assets, address(this));

        // Update allocation tracking
        MarketAllocation storage allocation = allocations[marketId];

        if (allocation.vault == address(0)) {
            // New market
            allocation.vault = vault;
            marketIds.push(marketId);
            emit MarketAdded(marketId, vault);
        }

        allocation.principalDeposited += assets;
        allocation.totalShares += shares;
        allocation.lastYieldHarvest = block.timestamp;

        totalPrincipal += assets;

        emit Allocated(marketId, vault, assets, shares);

        // Return market IDs and allocation change
        ids = new bytes32[](1);
        ids[0] = marketId;
        change = int256(assets);
    }

    /**
     * @notice Deallocate assets from an underlying market
     * @param data ABI-encoded (address vault, bytes32 marketId, uint256 maxSlippage)
     * @param assets Amount of assets to deallocate
     * @param selector Function selector (unused)
     * @param sender Original caller (unused)
     * @return ids Array of affected market IDs
     * @return change Change in allocation for this market
     *
     * @dev Harvests yield before deallocating to ensure accurate accounting
     * @dev Supports both normal redemptions and emergency deallocations
     */
    function deallocate(bytes memory data, uint256 assets, bytes4 selector, address sender)
        external
        nonReentrant
        returns (bytes32[] memory ids, int256 change)
    {
        if (msg.sender != parentVault) revert NotAuthorized();

        (address vault, bytes32 marketId, uint256 maxSlippage) = abi.decode(data, (address, bytes32, uint256));

        MarketAllocation storage allocation = allocations[marketId];
        if (allocation.vault != vault) revert InvalidMarket();

        // Harvest yield first
        _harvestYield(marketId);

        // Calculate shares to redeem
        uint256 sharesToRedeem;
        if (assets >= allocation.principalDeposited) {
            // Deallocating all principal
            sharesToRedeem = allocation.totalShares;
        } else {
            // Partial deallocation - proportional shares
            sharesToRedeem = (assets * allocation.totalShares) / allocation.principalDeposited;
        }

        // Redeem shares from underlying vault
        uint256 assetsReceived = IERC4626(vault).redeem(sharesToRedeem, address(this), address(this));

        // Slippage check
        uint256 minAssets = assets * (10000 - maxSlippage) / 10000;
        if (assetsReceived < minAssets) revert SlippageTooHigh();

        // Update allocation tracking
        allocation.totalShares -= sharesToRedeem;

        uint256 principalReduction = assets > allocation.principalDeposited ? allocation.principalDeposited : assets;
        allocation.principalDeposited -= principalReduction;
        totalPrincipal -= principalReduction;

        // Remove market if fully deallocated
        if (allocation.totalShares == 0) {
            delete allocations[marketId];
            _removeMarketId(marketId);
            emit MarketRemoved(marketId);
        }

        // Transfer assets back to parent vault
        IERC20(asset).safeTransfer(parentVault, assetsReceived);

        emit Deallocated(marketId, vault, assetsReceived, sharesToRedeem);

        // Return market IDs and allocation change
        ids = new bytes32[](1);
        ids[0] = marketId;
        change = -int256(assetsReceived);
    }

    /**
     * @notice Get total real assets held by adapter across all markets
     * @return assets Total asset value (principal + unrealized yield)
     *
     * @dev Called by Morpho Vault V2 during interest accrual
     * @dev Iterates through all active markets - gas cost increases with market count
     */
    function realAssets() external view returns (uint256 assets) {
        for (uint256 i = 0; i < marketIds.length; i++) {
            bytes32 marketId = marketIds[i];
            MarketAllocation memory allocation = allocations[marketId];

            if (allocation.totalShares > 0) {
                // Convert shares to assets using current vault exchange rate
                assets += IERC4626(allocation.vault).convertToAssets(allocation.totalShares);
            }
        }
    }

    /**
     * @notice Harvest yield from a specific market and route to PaymentSplitter
     * @param marketId Market to harvest from
     *
     * @dev Public function - anyone can trigger yield harvest
     * @dev Only harvests positive yield (doesn't touch principal on losses)
     */
    function harvestYield(bytes32 marketId) external nonReentrant {
        _harvestYield(marketId);
    }

    /**
     * @dev Internal yield harvesting logic
     * @dev Calculates yield as: current_value - principal - already_harvested
     */
    function _harvestYield(bytes32 marketId) internal {
        MarketAllocation storage allocation = allocations[marketId];
        if (allocation.totalShares == 0) return;

        // Calculate current value
        uint256 currentValue = IERC4626(allocation.vault).convertToAssets(allocation.totalShares);

        // Yield = current value - principal (only if positive)
        if (currentValue <= allocation.principalDeposited) {
            // No yield or unrealized loss - don't harvest
            return;
        }

        uint256 yieldAmount = currentValue - allocation.principalDeposited;

        if (yieldAmount == 0) return;

        // Redeem yield portion only
        uint256 yieldShares = IERC4626(allocation.vault).convertToShares(yieldAmount);
        uint256 yieldReceived = IERC4626(allocation.vault).redeem(yieldShares, address(this), address(this));

        // Update allocation
        allocation.totalShares -= yieldShares;
        allocation.lastYieldHarvest = block.timestamp;

        // Route to PaymentSplitter
        IERC20(asset).safeTransfer(paymentSplitter, yieldReceived);

        totalYieldDonated += yieldReceived;

        emit YieldHarvested(marketId, yieldReceived, totalYieldDonated);
    }

    /**
     * @notice Get number of active markets
     */
    function marketCount() external view returns (uint256) {
        return marketIds.length;
    }

    /**
     * @notice Get allocation details for a market
     */
    function getAllocation(bytes32 marketId) external view returns (MarketAllocation memory) {
        return allocations[marketId];
    }

    /**
     * @notice Calculate harvestable yield for a market
     */
    function harvestableYield(bytes32 marketId) external view returns (uint256) {
        MarketAllocation memory allocation = allocations[marketId];
        if (allocation.totalShares == 0) return 0;

        uint256 currentValue = IERC4626(allocation.vault).convertToAssets(allocation.totalShares);

        if (currentValue <= allocation.principalDeposited) {
            return 0;
        }

        return currentValue - allocation.principalDeposited;
    }
    /**
     * @dev Remove market ID from array
     */

    function _removeMarketId(bytes32 marketId) internal {
        for (uint256 i = 0; i < marketIds.length; i++) {
            if (marketIds[i] == marketId) {
                marketIds[i] = marketIds[marketIds.length - 1];
                marketIds.pop();
                break;
            }
        }
    }
}
