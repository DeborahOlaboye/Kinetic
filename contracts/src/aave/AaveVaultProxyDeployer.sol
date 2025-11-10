// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ATokenVault} from "./ATokenVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title AaveVaultProxyDeployer
 * @notice Lightweight deployer for ATokenVault proxies - avoids contract size limits
 * @dev Uses already deployed implementations, only deploys proxies
 */
contract AaveVaultProxyDeployer {
    using SafeERC20 for IERC20;

    // ============================================
    // Immutables - Implementation Addresses
    // ============================================

    address public immutable USDC_VAULT_IMPL;
    address public immutable DAI_VAULT_IMPL;
    address public immutable USDT_VAULT_IMPL;

    // ============================================
    // Constants
    // ============================================

    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint256 public constant INITIAL_LOCK_DEPOSIT_USDC = 1e6;  // 1 USDC (6 decimals)
    uint256 public constant INITIAL_LOCK_DEPOSIT_DAI = 1e18; // 1 DAI (18 decimals)
    uint256 public constant INITIAL_LOCK_DEPOSIT_USDT = 1e6; // 1 USDT (6 decimals)

    // ============================================
    // State Variables
    // ============================================

    mapping(address => address[]) private userVaults;
    mapping(address => address) public vaultOwner;
    address[] public allVaults;

    // ============================================
    // Events
    // ============================================

    event VaultDeployed(
        address indexed user,
        address indexed vault,
        address indexed asset,
        address implementation
    );

    // ============================================
    // Constructor
    // ============================================

    constructor(
        address usdcImpl,
        address daiImpl,
        address usdtImpl
    ) {
        require(usdcImpl != address(0), "Invalid USDC impl");
        require(daiImpl != address(0), "Invalid DAI impl");
        require(usdtImpl != address(0), "Invalid USDT impl");

        USDC_VAULT_IMPL = usdcImpl;
        DAI_VAULT_IMPL = daiImpl;
        USDT_VAULT_IMPL = usdtImpl;
    }

    // ============================================
    // Main Functions
    // ============================================

    /**
     * @notice Deploy a new Aave vault proxy
     * @param asset Underlying asset (USDC, DAI, or USDT)
     * @param owner Vault owner address
     * @param initialFee Fee percentage (1e18 = 100%)
     * @return vault The deployed vault proxy address
     */
    function deployVault(
        address asset,
        address owner,
        uint256 initialFee
    ) external returns (address vault) {
        require(owner != address(0), "Invalid owner");

        // Get implementation and deposit amount
        (address implementation, uint256 initialDeposit, string memory symbol) = _getAssetConfig(asset);

        // Transfer initial deposit from user
        IERC20(asset).safeTransferFrom(msg.sender, address(this), initialDeposit);

        // Generate vault metadata
        string memory shareName = string(abi.encodePacked("Kinetic Aave ", symbol, " Vault"));
        string memory shareSymbol = string(abi.encodePacked("ka", symbol));

        // Deploy proxy WITHOUT initialization first
        bytes memory emptyInitData = "";
        ERC1967Proxy proxy = new ERC1967Proxy(implementation, emptyInitData);
        vault = address(proxy);

        // Approve vault to pull initial deposit BEFORE initializing (using forceApprove for OpenZeppelin v5)
        IERC20(asset).forceApprove(vault, initialDeposit);

        // Now initialize the vault (can call directly since proxy is deployed)
        ATokenVault(vault).initialize(
            owner,
            initialFee,
            shareName,
            shareSymbol,
            initialDeposit
        );

        // Track deployment
        userVaults[msg.sender].push(vault);
        vaultOwner[vault] = owner;
        allVaults.push(vault);

        emit VaultDeployed(msg.sender, vault, asset, implementation);

        return vault;
    }

    // ============================================
    // View Functions
    // ============================================

    /**
     * @notice Get all vaults deployed by a user
     * @param user User address
     * @return Array of vault addresses
     */
    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }

    /**
     * @notice Get total number of deployed vaults
     */
    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    /**
     * @notice Get vault at index
     */
    function getVault(uint256 index) external view returns (address) {
        return allVaults[index];
    }

    // ============================================
    // Internal Functions
    // ============================================

    /**
     * @dev Get asset-specific configuration
     */
    function _getAssetConfig(address asset) internal view returns (
        address implementation,
        uint256 initialDeposit,
        string memory symbol
    ) {
        if (asset == USDC) {
            return (USDC_VAULT_IMPL, INITIAL_LOCK_DEPOSIT_USDC, "USDC");
        } else if (asset == DAI) {
            return (DAI_VAULT_IMPL, INITIAL_LOCK_DEPOSIT_DAI, "DAI");
        } else if (asset == USDT) {
            return (USDT_VAULT_IMPL, INITIAL_LOCK_DEPOSIT_USDT, "USDT");
        } else {
            revert("Unsupported asset");
        }
    }
}
