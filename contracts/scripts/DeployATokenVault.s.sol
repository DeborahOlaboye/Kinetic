// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ATokenVault} from "../src/aave/ATokenVault.sol";
import {IPoolAddressesProvider} from "@aave-v3-core/interfaces/IPoolAddressesProvider.sol";

/**
 * @title DeployATokenVault
 * @notice Deploys ATokenVault implementation for USDC on Ethereum Mainnet
 * @dev This deploys the implementation contract that can be used with proxy pattern
 */
contract DeployATokenVault is Script {
    // Ethereum Mainnet Aave V3 addresses
    address constant POOL_ADDRESSES_PROVIDER = 0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint16 constant REFERRAL_CODE = 0;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("==========================================");
        console2.log("ATOKEN VAULT IMPLEMENTATION DEPLOYMENT");
        console2.log("==========================================");
        console2.log("Deployer:", deployer);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy implementations for each supported asset
        console2.log("Deploying ATokenVault implementations...");
        console2.log("");

        // USDC Vault
        console2.log("1. USDC Vault Implementation");
        ATokenVault usdcVault = new ATokenVault(
            USDC,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER)
        );
        console2.log("   Address:", address(usdcVault));

        // DAI Vault
        console2.log("");
        console2.log("2. DAI Vault Implementation");
        ATokenVault daiVault = new ATokenVault(
            DAI,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER)
        );
        console2.log("   Address:", address(daiVault));

        // USDT Vault
        console2.log("");
        console2.log("3. USDT Vault Implementation");
        ATokenVault usdtVault = new ATokenVault(
            USDT,
            REFERRAL_CODE,
            IPoolAddressesProvider(POOL_ADDRESSES_PROVIDER)
        );
        console2.log("   Address:", address(usdtVault));

        vm.stopBroadcast();

        console2.log("");
        console2.log("==========================================");
        console2.log("DEPLOYMENT SUMMARY");
        console2.log("==========================================");
        console2.log("USDC Vault Implementation:", address(usdcVault));
        console2.log("DAI Vault Implementation:", address(daiVault));
        console2.log("USDT Vault Implementation:", address(usdtVault));
        console2.log("");
        console2.log("Add to contracts/.env:");
        console2.log("ATOKEN_VAULT_USDC_IMPL=%s", address(usdcVault));
        console2.log("ATOKEN_VAULT_DAI_IMPL=%s", address(daiVault));
        console2.log("ATOKEN_VAULT_USDT_IMPL=%s", address(usdtVault));
        console2.log("");
        console2.log("Add to frontend/.env:");
        console2.log("VITE_ATOKEN_VAULT_USDC_IMPL=%s", address(usdcVault));
        console2.log("VITE_ATOKEN_VAULT_DAI_IMPL=%s", address(daiVault));
        console2.log("VITE_ATOKEN_VAULT_USDT_IMPL=%s", address(usdtVault));
        console2.log("");
        console2.log("NOTE: These are implementation contracts.");
        console2.log("They must be initialized via proxy or factory.");
        console2.log("==========================================");
    }
}
