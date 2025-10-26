// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import { BaseStrategy } from "./BaseStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingStrategy is BaseStrategy {
    constructor(IERC20 _asset) BaseStrategy(_asset, "Staking Strategy Vault", "stVault", 700 ) {
        // Custom initialization logic can go here
    }
}