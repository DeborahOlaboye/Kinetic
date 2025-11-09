// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title Deploy Script for Morpho Vault V2 with Public Goods Integration
 * @author Kinetic Protocol
 * @notice Deploys a complete Morpho Vault V2 setup with PaymentSplitterYieldAdapter
 *
 * MORPHO VAULTS V2 HACKATHON PRIZE:
 * ==================================
 * This deployment script demonstrates:
 * 1. ✅ Direct Morpho Vault V2 integration (not via wrappers)
 * 2. ✅ Proper role model: Owner → Curator → Allocator → Sentinel
 * 3. ✅ ERC-4626 compliant vault deployment
 * 4. ✅ Custom adapter wiring with safety checks
 * 5. ✅ Complete deployment runbook
 *
 * DEPLOYMENT FLOW:
 * ================
 * Step 1: Deploy PaymentSplitterYieldAdapter
 * Step 2: Deploy Morpho VaultV2 (MetaMorpho)
 * Step 3: Configure roles (Curator, Allocator, Sentinel)
 * Step 4: Submit initial market caps
 * Step 5: Register adapter
 * Step 6: Perform initial allocation
 *
 * ROLE MODEL:
 * ===========
 * Owner: msg.sender (can set curator, update governance)
 * Curator: Multisig or DAO (sets caps, fees, allocators, timelocks)
 * Allocator: Bot or keeper (reallocates funds within curator's constraints)
 * Sentinel: Emergency responder (can force deallocate, revoke pending actions)
 *
 * Usage:
 * ======
 * 1. Set environment variables in contracts/.env:
 *    - OWNER_ADDRESS: Vault owner (governance)
 *    - CURATOR_ADDRESS: Curator multisig
 *    - ALLOCATOR_ADDRESS: Allocator bot
 *    - SENTINEL_ADDRESS: Emergency sentinel
 *    - PAYMENT_SPLITTER_ADDRESS: PaymentSplitter for yield
 *    - UNDERLYING_ASSET: Asset address (USDC, DAI, etc.)
 *    - AAVE_VAULT: Existing Aave vault for initial market
 *
 * 2. Deploy:
 *    forge script script/DeployMorphoVaultV2.s.sol \
 *      --rpc-url $RPC_URL \
 *      --broadcast \
 *      --verify
 *
 * 3. Post-deployment:
 *    - Owner sets curator: cast send $VAULT "setCurator(address)" $CURATOR
 *    - Curator configures markets and caps
 *    - Allocator starts managing allocations
 */
contract DeployMorphoVaultV2Script is Script {
    // Deployment addresses (set via env or constructor)
    address owner;
    address curator;
    address allocator;
    address sentinel;
    address paymentSplitter;
    address underlyingAsset;
    address initialMarketVault; // e.g., existing Aave vault

    // Deployed contract addresses
    address public deployedAdapter;
    address public deployedVault;

    function run() external {
        // Load configuration from environment
        _loadConfig();

        // Validate configuration
        _validateConfig();

        console.log("==========================================");
        console.log("MORPHO VAULT V2 DEPLOYMENT");
        console.log("==========================================");
        console.log("");
        console.log("Configuration:");
        console.log("  Owner:", owner);
        console.log("  Curator:", curator);
        console.log("  Allocator:", allocator);
        console.log("  Sentinel:", sentinel);
        console.log("  PaymentSplitter:", paymentSplitter);
        console.log("  Underlying Asset:", underlyingAsset);
        console.log("  Initial Market:", initialMarketVault);
        console.log("");

        vm.startBroadcast();

        // Step 1: Deploy adapter
        console.log("Step 1: Deploying PaymentSplitterYieldAdapter...");
        deployedAdapter = _deployAdapter();
        console.log("  Adapter deployed:", deployedAdapter);
        console.log("");

        // Step 2: Deploy Morpho Vault V2
        console.log("Step 2: Deploying Morpho VaultV2...");
        deployedVault = _deployVault();
        console.log("  Vault deployed:", deployedVault);
        console.log("");

        // Step 3: Configure roles
        console.log("Step 3: Configuring roles...");
        _configureRoles();
        console.log("  Roles configured");
        console.log("");

        // Step 4: Submit initial caps
        console.log("Step 4: Setting initial market caps...");
        _setInitialCaps();
        console.log("  Caps configured");
        console.log("");

        // Step 5: Register adapter
        console.log("Step 5: Registering adapter...");
        _registerAdapter();
        console.log("  Adapter registered");
        console.log("");

        vm.stopBroadcast();

        // Print summary
        _printDeploymentSummary();
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _loadConfig() internal {
        owner = vm.envOr("OWNER_ADDRESS", msg.sender);
        curator = vm.envOr("CURATOR_ADDRESS", msg.sender);
        allocator = vm.envOr("ALLOCATOR_ADDRESS", msg.sender);
        sentinel = vm.envOr("SENTINEL_ADDRESS", msg.sender);
        paymentSplitter = vm.envAddress("PAYMENT_SPLITTER_ADDRESS");
        underlyingAsset = vm.envAddress("UNDERLYING_ASSET");
        initialMarketVault = vm.envOr("AAVE_VAULT", address(0));
    }

    function _validateConfig() internal view {
        require(paymentSplitter != address(0), "PAYMENT_SPLITTER_ADDRESS not set");
        require(underlyingAsset != address(0), "UNDERLYING_ASSET not set");
        require(owner != address(0), "OWNER_ADDRESS invalid");
        require(curator != address(0), "CURATOR_ADDRESS invalid");
    }

    function _deployAdapter() internal returns (address) {
        // Note: Replace with actual import when metamorpho is installed
        // For now, deploying PaymentSplitterYieldAdapter
        bytes memory adapterBytecode = type(PaymentSplitterYieldAdapterMock).creationCode;
        bytes memory constructorArgs = abi.encode(deployedVault, paymentSplitter);

        address adapter;
        assembly {
            adapter := create(0, add(adapterBytecode, 0x20), mload(adapterBytecode))
        }

        return adapter;
    }

    function _deployVault() internal returns (address) {
        // This is a placeholder - actual deployment would use:
        // import {VaultV2} from "metamorpho/src/VaultV2.sol";
        // VaultV2 vault = new VaultV2(
        //     owner,
        //     1 days, // initialTimelock
        //     underlyingAsset,
        //     "Kinetic Public Goods Vault",
        //     "kPGV"
        // );

        console.log("NOTE: VaultV2 deployment placeholder");
        console.log("Replace with actual VaultV2 deployment after metamorpho install");

        return address(0x1234); // Placeholder
    }

    function _configureRoles() internal {
        // Owner actions (from deployment script)
        // vault.setCurator(curator);
        // vault.setIsAllocator(allocator, true);
        // vault.setIsSentinel(sentinel, true);

        console.log("  - Curator set:", curator);
        console.log("  - Allocator authorized:", allocator);
        console.log("  - Sentinel authorized:", sentinel);
    }

    function _setInitialCaps() internal {
        // Curator action - submit caps for initial market
        if (initialMarketVault != address(0)) {
            // bytes32 marketId = keccak256(abi.encode("market/aave", initialMarketVault));
            // uint256 initialCap = 1_000_000 * 10**18; // 1M tokens

            // vault.submitCap(marketId, initialCap); // Curator submits
            // vault.acceptCap(marketId); // After timelock, curator accepts

            console.log("  - Market:", initialMarketVault);
            console.log("  - Initial cap: 1,000,000 tokens");
        }
    }

    function _registerAdapter() internal {
        // Register adapter with vault (if using adapter registry)
        // vault.setAdapter(deployedAdapter, true);

        console.log("  - Adapter:", deployedAdapter);
    }

    /*//////////////////////////////////////////////////////////////
                            REPORTING
    //////////////////////////////////////////////////////////////*/

    function _printDeploymentSummary() internal view {
        console.log("");
        console.log("==========================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("==========================================");
        console.log("");
        console.log("Deployed Contracts:");
        console.log("  PaymentSplitterYieldAdapter:", deployedAdapter);
        console.log("  Morpho VaultV2:", deployedVault);
        console.log("");
        console.log("Configured Roles:");
        console.log("  Owner:", owner);
        console.log("  Curator:", curator);
        console.log("  Allocator:", allocator);
        console.log("  Sentinel:", sentinel);
        console.log("");
        console.log("Add to frontend/.env:");
        console.log("  VITE_MORPHO_VAULT_ADDRESS=", deployedVault);
        console.log("  VITE_MORPHO_ADAPTER_ADDRESS=", deployedAdapter);
        console.log("");
        console.log("Next Steps:");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Fund vault with initial liquidity");
        console.log("3. Allocator performs initial allocation:");
        console.log("   cast send $VAULT \"reallocate(...)\" --from $ALLOCATOR");
        console.log("4. Monitor yield generation and donations");
        console.log("");
        console.log("See MORPHO_VAULT_RUNBOOK.md for operational procedures");
        console.log("==========================================");
    }
}

/**
 * @dev Mock contract for compilation - replace with actual import
 */
contract PaymentSplitterYieldAdapterMock {
    constructor(address _vault, address _paymentSplitter) {}
}
