// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RecipientSplitter.sol";

/**
 * @title RecipientSplitterFactory
 * @notice Factory contract for deploying RecipientSplitter contracts
 * @dev Creates splitter contracts for distributing yield to multiple recipients
 */
contract RecipientSplitterFactory {
    struct Recipient {
        address account;
        uint256 shares;
    }

    event SplitterCreated(
        address indexed splitter,
        address indexed creator,
        string name
    );

    mapping(address => address[]) public userSplitters;
    address[] public allSplitters;

    /**
     * @notice Create a new RecipientSplitter contract
     * @param recipients Array of recipients with their share allocations
     * @param name Human-readable name for the splitter
     * @return splitter Address of the newly created splitter contract
     */
    function createSplitter(
        Recipient[] calldata recipients,
        string calldata name
    ) external returns (address splitter) {
        require(recipients.length > 0, "At least one recipient required");

        // Extract addresses and shares
        address[] memory payees = new address[](recipients.length);
        uint256[] memory shares = new uint256[](recipients.length);
        uint256 totalShares = 0;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i].account != address(0), "Invalid recipient address");
            require(recipients[i].shares > 0, "Shares must be greater than 0");

            payees[i] = recipients[i].account;
            shares[i] = recipients[i].shares;
            totalShares += recipients[i].shares;
        }

        require(totalShares == 100, "Total shares must equal 100");

        // Deploy the splitter
        RecipientSplitter newSplitter = new RecipientSplitter(
            payees,
            shares,
            name
        );

        splitter = address(newSplitter);

        // Track the splitter
        userSplitters[msg.sender].push(splitter);
        allSplitters.push(splitter);

        emit SplitterCreated(splitter, msg.sender, name);
    }

    /**
     * @notice Get all splitters created by a user
     * @param user Address of the user
     * @return Array of splitter addresses
     */
    function getUserSplitters(address user) external view returns (address[] memory) {
        return userSplitters[user];
    }

    /**
     * @notice Get total number of splitters created
     * @return Number of splitters
     */
    function getSplitterCount() external view returns (uint256) {
        return allSplitters.length;
    }
}
