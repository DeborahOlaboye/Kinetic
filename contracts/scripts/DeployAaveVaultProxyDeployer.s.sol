// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {AaveVaultProxyDeployer} from "../src/aave/AaveVaultProxyDeployer.sol";

/**
 * @title DeployAaveVaultProxyDeployer
 * @notice Deploys the lightweight proxy deployer for Aave vaults
 */
contract DeployAaveVaultProxyDeployer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get deployed implementation addresses from env
        address usdcImpl = vm.envAddress("ATOKEN_VAULT_USDC_IMPL");
        address daiImpl = vm.envAddress("ATOKEN_VAULT_DAI_IMPL");
        address usdtImpl = vm.envAddress("ATOKEN_VAULT_USDT_IMPL");

        console2.log("==========================================");
        console2.log("AAVE VAULT PROXY DEPLOYER");
        console2.log("==========================================");
        console2.log("Deployer:", deployer);
        console2.log("");
        console2.log("Implementation Addresses:");
        console2.log("  USDC:", usdcImpl);
        console2.log("  DAI:", daiImpl);
        console2.log("  USDT:", usdtImpl);
        console2.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the proxy deployer
        AaveVaultProxyDeployer proxyDeployer = new AaveVaultProxyDeployer(
            usdcImpl,
            daiImpl,
            usdtImpl
        );

        console2.log("AaveVaultProxyDeployer deployed at:", address(proxyDeployer));

        vm.stopBroadcast();

        console2.log("");
        console2.log("==========================================");
        console2.log("DEPLOYMENT SUMMARY");
        console2.log("==========================================");
        console2.log("AaveVaultProxyDeployer:", address(proxyDeployer));
        console2.log("");
        console2.log("Add to contracts/.env:");
        console2.log("AAVE_VAULT_PROXY_DEPLOYER=%s", address(proxyDeployer));
        console2.log("");
        console2.log("Add to frontend/.env:");
        console2.log("VITE_AAVE_VAULT_PROXY_DEPLOYER=%s", address(proxyDeployer));
        console2.log("");
        console2.log("Frontend Usage:");
        console2.log("  proxyDeployer.deployVault(asset, owner, fee)");
        console2.log("  - Returns: vault proxy address");
        console2.log("  - Each user gets their own vault proxy");
        console2.log("  - All proxies use same implementation");
        console2.log("==========================================");
    }
}
