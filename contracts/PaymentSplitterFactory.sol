// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {PaymentSplitter} from "src/PaymentSplitter.sol";

/**
 * @title PaymentSplitterFactory
 * @notice Clones a PaymentSplitter implementation and initializes it with payees/shares
 * @dev Frontend calls createSplitter(payees, shares_) to get a fresh splitter per deployment
 */
contract PaymentSplitterFactory {
    using Clones for address;

    address public immutable implementation;
    mapping(address => address[]) private _userSplitters;
    address[] private _allSplitters;

    event SplitterCreated(address indexed splitter, address indexed creator);

    constructor(address _implementation) {
        require(_implementation != address(0), "impl=0");
        implementation = _implementation;
    }

    function createSplitter(address[] calldata payees, uint256[] calldata shares_)
        external
        returns (address splitter)
    {
        splitter = Clones.clone(implementation);
        PaymentSplitter(payable(splitter)).initialize(payees, shares_);
        _userSplitters[msg.sender].push(splitter);
        _allSplitters.push(splitter);
        emit SplitterCreated(splitter, msg.sender);
    }

    function getUserSplitters(address user) external view returns (address[] memory) {
        return _userSplitters[user];
    }

    function getSplitterCount() external view returns (uint256) {
        return _allSplitters.length;
    }

    function allSplitters(uint256 index) external view returns (address) {
        return _allSplitters[index];
    }
}