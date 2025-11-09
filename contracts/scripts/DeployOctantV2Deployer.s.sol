// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {KineticOctantV2Deployer} from "../src/octant/KineticOctantV2Deployer.sol";

/**
 * @title Deploy Script for KineticOctantV2Deployer
 * @notice Deploys the wrapper contract for Octant V2 strategy deployment
 *
 * Usage:
 * forge script script/DeployOctantV2Deployer.s.sol:DeployOctantV2DeployerScript \
 *   --rpc-url $RPC_URL \
 *   --broadcast \
 *   --verify
 *
 * Required env vars:
 * - MORPHO_FACTORY_ADDRESS: Address of MorphoCompounderStrategyFactory
 * - SKY_FACTORY_ADDRESS: Address of SkyCompounderStrategyFactory
 * - TOKENIZED_STRATEGY_ADDRESS: Address of YieldDonatingTokenizedStrategy implementation
 * - PRIVATE_KEY: Deployer private key
 */
contract DeployOctantV2DeployerScript is Script {
    function run() external {
        // Load addresses from environment
        address morphoFactory = vm.envAddress("MORPHO_FACTORY_ADDRESS");
        address skyFactory = vm.envAddress("SKY_FACTORY_ADDRESS");
        address tokenizedStrategy = vm.envAddress("TOKENIZED_STRATEGY_ADDRESS");

        require(morphoFactory != address(0), "MORPHO_FACTORY_ADDRESS not set");
        require(skyFactory != address(0), "SKY_FACTORY_ADDRESS not set");
        require(tokenizedStrategy != address(0), "TOKENIZED_STRATEGY_ADDRESS not set");

        console.log("Deploying KineticOctantV2Deployer...");
        console.log("Morpho Factory:", morphoFactory);
        console.log("Sky Factory:", skyFactory);
        console.log("Tokenized Strategy:", tokenizedStrategy);

        vm.startBroadcast();

        KineticOctantV2Deployer deployer = new KineticOctantV2Deployer(
            morphoFactory,
            skyFactory,
            tokenizedStrategy
        );

        vm.stopBroadcast();

        console.log("KineticOctantV2Deployer deployed at:", address(deployer));
        console.log("");
        console.log("Add to frontend .env:");
        console.log("VITE_OCTANT_V2_DEPLOYER_ADDRESS=", address(deployer));
    }
}
