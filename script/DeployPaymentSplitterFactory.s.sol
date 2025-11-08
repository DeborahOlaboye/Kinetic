// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;
import "forge-std/Script.sol";
import {PaymentSplitter} from "src/PaymentSplitter.sol";
import {PaymentSplitterFactory} from "../contracts/PaymentSplitterFactory.sol";

contract DeployPaymentSplitterFactory is Script {
    function run() external {
        // Use ENV: PRIVATE_KEY (or broadcast with --private-key)
        vm.startBroadcast();

        // 1) Deploy implementation (initializable)
        PaymentSplitter implementation = new PaymentSplitter();

        // 2) Deploy factory pointing to implementation
        PaymentSplitterFactory factory = new PaymentSplitterFactory(address(implementation));

        vm.stopBroadcast();

        console2.log("PaymentSplitter implementation:", address(implementation));
        console2.log("PaymentSplitterFactory:", address(factory));
    }
}