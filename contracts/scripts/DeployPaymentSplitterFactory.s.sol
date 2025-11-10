// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {PaymentSplitter} from "../src/PaymentSplitter.sol";
import {PaymentSplitterFactory} from "../src/PaymentSplitterFactory.sol";

contract DeployPaymentSplitterFactory is Script {
    function run() external {
        vm.startBroadcast();

        PaymentSplitter implementation = new PaymentSplitter();

        PaymentSplitterFactory factory = new PaymentSplitterFactory(address(implementation));

        vm.stopBroadcast();

        console2.log("PaymentSplitter implementation:", address(implementation));
        console2.log("PaymentSplitterFactory:", address(factory));
    }
}