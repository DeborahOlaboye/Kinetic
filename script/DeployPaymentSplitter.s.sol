// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {PaymentSplitter} from "../src/PaymentSplitter.sol";

/**
 * @title DeployPaymentSplitter
 * @notice Deployment script for PaymentSplitter contract
 * @dev Run with: forge script script/DeployPaymentSplitter.s.sol:DeployPaymentSplitter --rpc-url <your-rpc-url> --broadcast
 */
contract DeployPaymentSplitter is Script {
    function run() external returns (PaymentSplitter) {
        // Example payees and shares - MODIFY THESE BEFORE DEPLOYING
        address[] memory payees = new address[](3);
        payees[0] = 0x1Ff9eA9F062C31cfF19Ade558E34894f07Cf7817;
        payees[1] = 0x2c8D82a53f11B0E9B527a111B2f53C5D5E809806;
        payees[2] = 0x86b9A7edCb1C4bC783a92f9BdB4B06E8B4F1abEA;

        uint256[] memory shares = new uint256[](3);
        shares[0] = 50; // 50% for payee[0]
        shares[1] = 30; // 30% for payee[1]
        shares[2] = 20; // 20% for payee[2]

        vm.startBroadcast();

        // Deploy the PaymentSplitter
        PaymentSplitter splitter = new PaymentSplitter();

        // Initialize with payees and shares
        splitter.initialize(payees, shares);

        vm.stopBroadcast();

        return splitter;
    }
}
