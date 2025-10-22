// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Vault is Ownable, ReentrancyGuard {
    struct UserData {
        uint256 lockedBalance;
        uint256 availableBalance;
    }

    IERC20 public immutable vUSDT;
    mapping(address => UserData) public userData;

    // ---------- Events ----------
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event CollateralLocked(address indexed user, uint256 amount);
    event CollateralUnlocked(address indexed user, uint256 amount);

    constructor(address _vUSDT) Ownable(msg.sender) {
        require(_vUSDT != address(0), "Invalid token");
        vUSDT = IERC20(_vUSDT);
    }

    // ---------- User Functions ----------

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Zero amount");
        require(
            vUSDT.allowance(msg.sender, address(this)) >= _amount,
            "Allowance too low"
        );
        require(vUSDT.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        userData[msg.sender].availableBalance += _amount;
        emit Deposited(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Zero amount");
        UserData storage data = userData[msg.sender];
        require(data.availableBalance >= _amount, "Insufficient balance");

        data.availableBalance -= _amount;
        require(vUSDT.transfer(msg.sender, _amount), "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }

    // ---------- Collateral Management ----------

    /**
     * @notice Locks a user's available balance into collateral.
     */
    function lockCollateral(address _user, uint256 _amount) external {
        require(_amount > 0, "Amount should be greater than 0");
        require(
            userData[_user].availableBalance >= _amount,
            "Insufficient available balance"
        );

        userData[_user].availableBalance -= _amount;
        userData[_user].lockedBalance += _amount;

        emit CollateralLocked(_user, _amount);
    }

    /**
     * @notice Unlocks previously locked collateral back to available balance.
     */
    function unlockCollateral(address _user, uint256 _amount) external {
        require(_amount > 0, "Amount should be greater than 0");
        require(
            userData[_user].lockedBalance >= _amount,
            "Insufficient locked balance to unlock"
        );

        userData[_user].lockedBalance -= _amount;
        userData[_user].availableBalance += _amount;

        emit CollateralUnlocked(_user, _amount);
    }

    // ---------- View Functions ----------

    function getBalance(address _user) external view returns (UserData memory) {
        return userData[_user];
    }
}