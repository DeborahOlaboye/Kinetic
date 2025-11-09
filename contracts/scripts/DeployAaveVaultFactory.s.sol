// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {AaveVaultFactory} from "../src/aave/AaveVaultFactory.sol";

/**
 * @title DeployAaveVaultFactory
 * @notice Deploys the Aave Vault Factory for creating ERC-4626 vaults with yield routing
 */
contract DeployAaveVaultFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("==========================================");
        console2.log("AAVE VAULT FACTORY DEPLOYMENT");
        console2.log("==========================================");
        console2.log("Deployer:", deployer);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the factory
        AaveVaultFactory factory = new AaveVaultFactory();

        console2.log("AaveVaultFactory deployed at:", address(factory));

        vm.stopBroadcast();

        console2.log("");
        console2.log("==========================================");
        console2.log("DEPLOYMENT SUMMARY");
        console2.log("==========================================");
        console2.log("AaveVaultFactory:", address(factory));
        console2.log("");
        console2.log("Supported Assets:");
        console2.log("  USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
        console2.log("  DAI:  0x6B175474E89094C44Da98b954EedeAC495271d0F");
        console2.log("  USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7");
        console2.log("");
        console2.log("Add to contracts/.env:");
        console2.log("AAVE_VAULT_FACTORY_ADDRESS=%s", address(factory));
        console2.log("");
        console2.log("Add to frontend/.env:");
        console2.log("VITE_AAVE_VAULT_FACTORY_ADDRESS=%s", address(factory));
        console2.log("==========================================");
    }
}
