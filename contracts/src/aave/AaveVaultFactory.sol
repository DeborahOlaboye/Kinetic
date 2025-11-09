// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ImmutableATokenVault} from "./ImmutableATokenVault.sol";
import {ATokenVaultRevenueSplitterOwner} from "./ATokenVaultRevenueSplitterOwner.sol";
import {IPoolAddressesProvider} from "@aave-v3-core/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AaveVaultFactory
 * @notice Factory for deploying ImmutableATokenVault + ATokenVaultRevenueSplitterOwner
 * @dev Follows PaymentSplitterFactory pattern for frontend integration:
 *      1. User enters recipient addresses and shares in RecipientForm
 *      2. Frontend calls factory.createVault(asset, recipients, shares)
 *      3. Factory deploys vault + revenue splitter atomically
 *      4. Returns vault address via getUserVaults() (same pattern as PaymentSplitter)
 */
contract AaveVaultFactory {
    using SafeERC20 for IERC20;

    // ============================================
    // Constants
    // ============================================

    /// @notice Aave V3 Pool Addresses Provider (Ethereum Mainnet)
    address public constant POOL_ADDRESSES_PROVIDER = 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e;

    /// @notice Aave referral code (0 = no referral)
    uint16 public constant REFERRAL_CODE = 0;

    /// @notice Fee percentage: 1e18 = 100% (all yield to public goods)
    uint256 public constant INITIAL_FEE = 1e18;

    // Initial lock deposits per asset (prevents inflation attack)
    uint256 public constant INITIAL_LOCK_DEPOSIT_USDC = 1e6; // 1 USDC (6 decimals)
    uint256 public constant INITIAL_LOCK_DEPOSIT_DAI = 1e18; // 1 DAI (18 decimals)
    uint256 public constant INITIAL_LOCK_DEPOSIT_USDT = 1e6; // 1 USDT (6 decimals)

    // Supported assets (Ethereum Mainnet)
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    // ============================================
    // State Variables
    // ============================================

    /// @notice Track vaults per user (mirrors PaymentSplitterFactory)
    mapping(address => address[]) private userVaults;

    /// @notice Map vault address to its revenue splitter
    mapping(address => address) public vaultToSplitter;

    /// @notice All deployed vaults
    address[] public allVaults;

    // ============================================
    // Events
    // ============================================

    event VaultCreated(
        address indexed creator, address indexed vault, address indexed splitter, address asset, uint256 recipientCount
    );

    // ============================================
    // Main Functions
    // ============================================

    /**
     * @notice Deploy a new Aave vault with revenue splitting
     * @param asset Underlying asset (USDC, DAI, or USDT)
     * @param recipients Array of recipient addresses
     * @param shares Array of shares in basis points (must total 10000)
     * @return vaultAddress Deployed vault address
     * @return splitterAddress Deployed revenue splitter address
     *
     * @dev Frontend usage (mirrors PaymentSplitter):
     * ```javascript
     * const recipients = ['0x123...', '0x456...'];
     * const shares = [5000, 5000]; // 50%, 50% in basis points
     * const tx = await factory.createVault(USDC_ADDRESS, recipients, shares);
     * await tx.wait();
     * const vaults = await factory.getUserVaults(userAddress);
     * const newVault = vaults[vaults.length - 1]; // Latest vault
     * ```
     */
    function createVault(address asset, address[] calldata recipients, uint256[] calldata shares)
        external
        returns (address vaultAddress, address splitterAddress)
    {
        // Input validation
        require(recipients.length > 0, "No recipients");
        require(recipients.length == shares.length, "Length mismatch");
        require(_isSupportedAsset(asset), "Unsupported asset");

        // Validate shares total 10000 (100% in basis points)
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            require(shares[i] > 0, "Share must be > 0");
            require(shares[i] <= 10000, "Share exceeds 100%");
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Shares must total 10000");

        // Get asset-specific parameters
        uint256 initialLockDeposit = _getInitialLockDeposit(asset);
        string memory assetSymbol = _getAssetSymbol(asset);

        // Transfer initial lock deposit from user
        IERC20(asset).safeTransferFrom(msg.sender, address(this), initialLockDeposit);

        // Approve for vault deployment
        IERC20(asset).safeApprove(address(this), initialLockDeposit);

        // Generate vault metadata
        string memory shareName = string(abi.encodePacked("Kinetic Aave ", assetSymbol, " Vault"));
        string memory shareSymbol = string(abi.encodePacked("ka", assetSymbol));

        // Deploy vault (temporarily owned by factory)
        ImmutableATokenVault vault = new ImmutableATokenVault(
            asset,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER),
            address(this), // Temporary owner
            INITIAL_FEE,
            shareName,
            shareSymbol,
            initialLockDeposit
        );

        // Convert frontend format (address[], uint256[]) to contract format
        ATokenVaultRevenueSplitterOwner.Recipient[] memory recipientsArray =
            new ATokenVaultRevenueSplitterOwner.Recipient[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            recipientsArray[i] =
                ATokenVaultRevenueSplitterOwner.Recipient({addr: recipients[i], shareInBps: uint16(shares[i])});
        }

        // Deploy revenue splitter
        ATokenVaultRevenueSplitterOwner splitter = new ATokenVaultRevenueSplitterOwner(
            address(vault),
            msg.sender, // User becomes splitter owner
            recipientsArray
        );

        // Transfer vault ownership to splitter
        vault.transferOwnership(address(splitter));

        // Track deployments
        vaultAddress = address(vault);
        splitterAddress = address(splitter);

        userVaults[msg.sender].push(vaultAddress);
        vaultToSplitter[vaultAddress] = splitterAddress;
        allVaults.push(vaultAddress);

        emit VaultCreated(msg.sender, vaultAddress, splitterAddress, asset, recipients.length);

        return (vaultAddress, splitterAddress);
    }

    // ============================================
    // View Functions (Mirror PaymentSplitterFactory)
    // ============================================

    /**
     * @notice Get all vaults created by a user
     * @param user User address
     * @return Array of vault addresses
     *
     * @dev Mirrors PaymentSplitterFactory.getUserSplitters()
     * Frontend retrieves deployed vault:
     * ```javascript
     * const vaults = await factory.getUserVaults(userAddress);
     * const latestVault = vaults[vaults.length - 1];
     * ```
     */
    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    /**
     * @notice Get total vault count
     */
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Get revenue splitter for a vault
     * @param vault Vault address
     * @return Revenue splitter address
     */
    function getSplitterForVault(address vault) external view returns (address) {
        return vaultToSplitter[vault];
    }

    // ============================================
    // Internal Helpers
    // ============================================

    function _isSupportedAsset(address asset) internal pure returns (bool) {
        return asset == USDC || asset == DAI || asset == USDT;
    }

    function _getInitialLockDeposit(address asset) internal pure returns (uint256) {
        if (asset == USDC) return INITIAL_LOCK_DEPOSIT_USDC;
        if (asset == DAI) return INITIAL_LOCK_DEPOSIT_DAI;
        if (asset == USDT) return INITIAL_LOCK_DEPOSIT_USDT;
        revert("Unsupported asset");
    }

    function _getAssetSymbol(address asset) internal pure returns (string memory) {
        if (asset == USDC) return "USDC";
        if (asset == DAI) return "DAI";
        if (asset == USDT) return "USDT";
        return "UNKNOWN";
    }
}
