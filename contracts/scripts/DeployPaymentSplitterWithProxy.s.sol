// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {PaymentSplitter} from "../src/PaymentSplitter.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployPaymentSplitterWithProxy
 * @notice Deployment script for PaymentSplitter using proxy pattern
 * @dev Deploys implementation + proxy, then initializes through proxy
 */
contract DeployPaymentSplitterWithProxy is Script {
    function run() external returns (address) {
        // MODIFY THESE - Your project's payees and shares
        address[] memory payees = new address[](3);
        payees[0] = 0x1Ff9eA9F062C31cfF19Ade558E34894f07Cf7817; // Replace with actual address
        payees[1] = 0x2c8D82a53f11B0E9B527a111B2f53C5D5E809806; // Replace with actual address
        payees[2] = 0x86b9A7edCb1C4bC783a92f9BdB4B06E8B4F1abEA; // Replace with actual address

        uint256[] memory shares = new uint256[](3);
        shares[0] = 50; // 50/100 = 50%
        shares[1] = 30; // 30/100 = 30%
        shares[2] = 20; // 20/100 = 20%

        vm.startBroadcast();

        // Step 1: Deploy the implementation contract
        PaymentSplitter implementation = new PaymentSplitter();

        // Step 2: Encode the initialize call
        bytes memory initData = abi.encodeWithSelector(
            PaymentSplitter.initialize.selector,
            payees,
            shares
        );

        // Step 3: Deploy the proxy pointing to implementation
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        // The proxy address is what you'll interact with
        return address(proxy);
    }
}
