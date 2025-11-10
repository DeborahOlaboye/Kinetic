// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

// Import Octant V2 factories from the cloned repository
import {MorphoCompounderStrategyFactory} from "octant-v2-core/factories/MorphoCompounderStrategyFactory.sol";
import {SkyCompounderStrategyFactory} from "octant-v2-core/factories/SkyCompounderStrategyFactory.sol";
import {YieldDonatingTokenizedStrategy} from "octant-v2-core/strategies/yieldDonating/YieldDonatingTokenizedStrategy.sol";

// Import our wrapper
import {KineticOctantV2Deployer} from "../src/octant/KineticOctantV2Deployer.sol";

/**
 * @title DeployOctantV2
 * @notice Deploys the full Octant V2 stack:
 *         1. YieldDonatingTokenizedStrategy (implementation)
 *         2. MorphoCompounderStrategyFactory
 *         3. SkyCompounderStrategyFactory
 *         4. KineticOctantV2Deployer (wrapper)
 *
 * Usage:
 * forge script scripts/DeployOctantV2.s.sol --fork-url $RPC_URL --broadcast --legacy
 */
contract DeployOctantV2 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("==============================================");
        console2.log("Deploying Octant V2 Stack");
        console2.log("==============================================");
        console2.log("Deployer:", deployer);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy YieldDonatingTokenizedStrategy implementation
        console2.log("1. Deploying YieldDonatingTokenizedStrategy...");
        YieldDonatingTokenizedStrategy tokenizedStrategy = new YieldDonatingTokenizedStrategy();
        console2.log("   YieldDonatingTokenizedStrategy:", address(tokenizedStrategy));

        // Step 2: Deploy MorphoCompounderStrategyFactory
        console2.log("");
        console2.log("2. Deploying MorphoCompounderStrategyFactory...");
        MorphoCompounderStrategyFactory morphoFactory = new MorphoCompounderStrategyFactory();
        console2.log("   MorphoCompounderStrategyFactory:", address(morphoFactory));

        // Step 3: Deploy SkyCompounderStrategyFactory
        console2.log("");
        console2.log("3. Deploying SkyCompounderStrategyFactory...");
        SkyCompounderStrategyFactory skyFactory = new SkyCompounderStrategyFactory();
        console2.log("   SkyCompounderStrategyFactory:", address(skyFactory));

        // Step 4: Deploy KineticOctantV2Deployer
        console2.log("");
        console2.log("4. Deploying KineticOctantV2Deployer...");
        KineticOctantV2Deployer octantDeployer = new KineticOctantV2Deployer(
            address(morphoFactory),
            address(skyFactory),
            address(tokenizedStrategy)
        );
        console2.log("   KineticOctantV2Deployer:", address(octantDeployer));

        vm.stopBroadcast();

        console2.log("");
        console2.log("==============================================");
        console2.log("Deployment Summary");
        console2.log("==============================================");
        console2.log("YieldDonatingTokenizedStrategy:", address(tokenizedStrategy));
        console2.log("MorphoCompounderStrategyFactory:", address(morphoFactory));
        console2.log("SkyCompounderStrategyFactory:", address(skyFactory));
        console2.log("KineticOctantV2Deployer:", address(octantDeployer));
        console2.log("==============================================");
        console2.log("");
        console2.log("Add these to your .env files:");
        console2.log("");
        console2.log("# Octant V2 Contracts");
        console2.log(string.concat("YIELD_DONATING_TOKENIZED_STRATEGY=", vm.toString(address(tokenizedStrategy))));
        console2.log(string.concat("MORPHO_FACTORY=", vm.toString(address(morphoFactory))));
        console2.log(string.concat("SKY_FACTORY=", vm.toString(address(skyFactory))));
        console2.log(string.concat("OCTANT_V2_DEPLOYER=", vm.toString(address(octantDeployer))));
    }
}
