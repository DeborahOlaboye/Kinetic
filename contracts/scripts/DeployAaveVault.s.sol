// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ImmutableATokenVault} from "src/aave/ImmutableATokenVault.sol";
import {ATokenVaultRevenueSplitterOwner} from "src/aave/ATokenVaultRevenueSplitterOwner.sol";
import {IPoolAddressesProvider} from "@aave-v3-core/interfaces/IPoolAddressesProvider.sol";

/**
 * @title DeployAaveVault
 * @notice Deploys ImmutableATokenVault + ATokenVaultRevenueSplitterOwner for public goods funding
 * @dev This script:
 *      1. Deploys an ERC-4626 vault for a specific asset (USDC/DAI/USDT)
 *      2. Deploys a RevenueSplitterOwner with recipient addresses
 *      3. Sets the vault owner to the RevenueSplitterOwner
 *      4. Configures 100% fee (all yield goes to public goods)
 */
contract DeployAaveVault is Script {
    // Ethereum Mainnet Aave V3 addresses
    address constant POOL_ADDRESSES_PROVIDER = 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e;

    // Asset addresses (choose one for deployment)
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    // Deployment configuration
    uint16 constant REFERRAL_CODE = 0;
    uint256 constant INITIAL_FEE = 1e18; // 100% of yield to public goods
    uint256 constant INITIAL_LOCK_DEPOSIT_USDC = 1e6; // 1 USDC (6 decimals)
    uint256 constant INITIAL_LOCK_DEPOSIT_DAI = 1e18; // 1 DAI (18 decimals)
    uint256 constant INITIAL_LOCK_DEPOSIT_USDT = 1e6; // 1 USDT (6 decimals)

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deployer:", deployer);
        console2.log("PoolAddressesProvider:", POOL_ADDRESSES_PROVIDER);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy for USDC (can be changed to DAI or USDT)
        (address vault, address splitter) = deployVaultWithSplitter(
            USDC,
            "Kinetic Aave USDC Vault",
            "kaUSDC",
            INITIAL_LOCK_DEPOSIT_USDC
        );

        vm.stopBroadcast();

        console2.log("\n=== Deployment Complete ===");
        console2.log("Vault Address:", vault);
        console2.log("RevenueSplitter Address:", splitter);
        console2.log("\nSave these addresses to your .env:");
        console2.log("VITE_AAVE_VAULT_ADDRESS=%s", vault);
        console2.log("VITE_AAVE_REVENUE_SPLITTER_ADDRESS=%s", splitter);
    }

    /**
     * @notice Deploys vault + revenue splitter with example recipients
     * @param underlying Asset address (USDC/DAI/USDT)
     * @param shareName Vault share token name
     * @param shareSymbol Vault share token symbol
     * @param initialLockDeposit Initial deposit to prevent frontrunning
     */
    function deployVaultWithSplitter(
        address underlying,
        string memory shareName,
        string memory shareSymbol,
        uint256 initialLockDeposit
    ) public returns (address vaultAddress, address splitterAddress) {
        console2.log("\nDeploying vault for asset:", underlying);

        // Step 1: Deploy ImmutableATokenVault with temporary owner (deployer)
        ImmutableATokenVault vault = new ImmutableATokenVault(
            underlying,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER),
            msg.sender, // Temporary owner (will transfer to splitter)
            INITIAL_FEE,
            shareName,
            shareSymbol,
            initialLockDeposit
        );

        console2.log("Vault deployed:", address(vault));

        // Step 2: Configure recipients (EXAMPLE - replace with actual public goods addresses)
        ATokenVaultRevenueSplitterOwner.Recipient[] memory recipients =
            new ATokenVaultRevenueSplitterOwner.Recipient[](3);

        // Example recipients - 50%, 30%, 20% split
        // TODO: Replace these with real public goods project addresses
        recipients[0] = ATokenVaultRevenueSplitterOwner.Recipient({
            addr: 0x1234567890123456789012345678901234567890, // Replace!
            shareInBps: 5000 // 50%
        });
        recipients[1] = ATokenVaultRevenueSplitterOwner.Recipient({
            addr: 0x2345678901234567890123456789012345678901, // Replace!
            shareInBps: 3000 // 30%
        });
        recipients[2] = ATokenVaultRevenueSplitterOwner.Recipient({
            addr: 0x3456789012345678901234567890123456789012, // Replace!
            shareInBps: 2000 // 20%
        });

        // Step 3: Deploy RevenueSplitterOwner
        ATokenVaultRevenueSplitterOwner splitter = new ATokenVaultRevenueSplitterOwner(
            address(vault),
            msg.sender, // Splitter owner (can update vault fees, etc.)
            recipients
        );

        console2.log("RevenueSplitter deployed:", address(splitter));

        // Step 4: Transfer vault ownership to RevenueSplitter
        vault.transferOwnership(address(splitter));
        console2.log("Vault ownership transferred to RevenueSplitter");

        return (address(vault), address(splitter));
    }

    /**
     * @notice Helper: Deploy vault with dynamic recipients from frontend
     * @dev Call this when integrating with your PaymentSplitter
     */
    function deployVaultWithPaymentSplitter(
        address underlying,
        address paymentSplitter,
        string memory shareName,
        string memory shareSymbol,
        uint256 initialLockDeposit
    ) public returns (address vaultAddress) {
        console2.log("\nDeploying vault with PaymentSplitter integration");
        console2.log("Asset:", underlying);
        console2.log("PaymentSplitter:", paymentSplitter);

        // Deploy vault with PaymentSplitter as single recipient (100% of yield)
        ATokenVaultRevenueSplitterOwner.Recipient[] memory recipients =
            new ATokenVaultRevenueSplitterOwner.Recipient[](1);

        recipients[0] = ATokenVaultRevenueSplitterOwner.Recipient({
            addr: paymentSplitter,
            shareInBps: 10000 // 100% to PaymentSplitter
        });

        // Deploy vault
        ImmutableATokenVault vault = new ImmutableATokenVault(
            underlying,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER),
            msg.sender,
            INITIAL_FEE,
            shareName,
            shareSymbol,
            initialLockDeposit
        );

        // Deploy splitter with PaymentSplitter as sole recipient
        ATokenVaultRevenueSplitterOwner splitter = new ATokenVaultRevenueSplitterOwner(
            address(vault),
            msg.sender,
            recipients
        );

        // Transfer ownership
        vault.transferOwnership(address(splitter));

        console2.log("Vault deployed:", address(vault));
        console2.log("Revenue routing to PaymentSplitter:", paymentSplitter);

        return address(vault);
    }
}
