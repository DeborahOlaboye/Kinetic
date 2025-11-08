// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

/**
 * @title RecipientSplitter
 * @notice Distributes received funds (ETH and ERC20) to multiple recipients based on their allocation
 * @dev Extends OpenZeppelin's PaymentSplitter for automatic yield distribution
 */
contract RecipientSplitter is PaymentSplitter {
    string public name;

    event FundsReceived(address indexed from, uint256 amount);

    /**
     * @param _payees Array of recipient addresses
     * @param _shares Array of share amounts (corresponds to percentage allocations)
     * @param _name Human-readable name for this splitter
     */
    constructor(
        address[] memory _payees,
        uint256[] memory _shares,
        string memory _name
    ) PaymentSplitter(_payees, _shares) {
        name = _name;
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}
