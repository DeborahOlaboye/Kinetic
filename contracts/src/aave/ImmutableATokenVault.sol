// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ATokenVault} from "./ATokenVault.sol";
import {IPoolAddressesProvider} from "@aave-v3-core/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ImmutableATokenVault
 * @notice Non-upgradeable version of ATokenVault with constructor initialization
 * @dev Extends ATokenVault with immutable configuration set at deployment
 */
contract ImmutableATokenVault is ATokenVault, Ownable {
    using SafeERC20 for IERC20;

    /**
     * @notice Deploy and initialize the vault in one transaction
     * @param underlying Asset to accept (USDC, DAI, etc.)
     * @param referralCode Aave referral code
     * @param poolAddressesProvider Aave PoolAddressesProvider
     * @param initialOwner Vault owner (can update fees)
     * @param initialFee Fee percentage (1e18 = 100%)
     * @param shareName ERC20 name for vault shares
     * @param shareSymbol ERC20 symbol for vault shares
     * @param initialLockDeposit Amount to deposit and lock (prevents inflation attack)
     */
    constructor(
        address underlying,
        uint16 referralCode,
        IPoolAddressesProvider poolAddressesProvider,
        address initialOwner,
        uint256 initialFee,
        string memory shareName,
        string memory shareSymbol,
        uint256 initialLockDeposit
    ) ATokenVault(underlying, referralCode, poolAddressesProvider) Ownable(initialOwner) {
        // Initialize ERC20 metadata
        _name = shareName;
        _symbol = shareSymbol;

        // Set initial fee
        _setFee(initialFee);

        // Perform initial lock deposit (prevents share inflation attack)
        if (initialLockDeposit > 0) {
            IERC20(underlying).safeTransferFrom(msg.sender, address(this), initialLockDeposit);
            _deposit(initialLockDeposit, address(0xdead)); // Burn shares to dead address
        }
    }

    // ERC20 metadata storage
    string private _name;
    string private _symbol;

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Update fee (only owner)
     * @param newFee Fee in basis points (1e18 = 100%)
     */
    function setFee(uint256 newFee) external onlyOwner {
        _setFee(newFee);
    }
}
