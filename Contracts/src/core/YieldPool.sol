// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldPool {
    IERC20 public immutable vUSDT;
    uint256 public yieldRate;          // current yield %
    uint256 public lastUpdate;         // last time yield changed
    uint256 public totalDeposited;

    constructor(address _vUSDT) {
        vUSDT = IERC20(_vUSDT);
        _updateYield(); // initialize with random
    }

    // --- internal random update every 10 minutes ---
    function _updateYield() internal {
        if (block.timestamp >= lastUpdate + 10 minutes) {
            uint256 rand = uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao, address(this)))
            ) % 8; // 0–7
            yieldRate = 3 + rand; // 3–10%
            lastUpdate = block.timestamp;
        }
    }

    // --- deposit funds ---
    function deposit(uint256 amount) external {
        _updateYield();
        require(amount > 0, "Zero");
        vUSDT.transferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
    }

    // --- withdraw all + yield ---
    function withdrawAll(address to) external returns (uint256 totalOut) {
        _updateYield();
        uint256 yieldAmount = (totalDeposited * yieldRate) / 100;
        totalOut = totalDeposited + yieldAmount;
        totalDeposited = 0;
        vUSDT.transfer(to, totalOut);
    }

    // --- external getter ensures yield auto-refreshes when read ---
    function currentYield() external view returns (uint256) {
        return yieldRate;
    }
}