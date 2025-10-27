// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

contract StrategyManager is Ownable {
    struct StrategyInfo {
        address strategy;
        uint256 allocation; // Allocation in basis points (10000 = 100%)
        bool active;
    }
    StrategyInfo[] public strategies;
    address public vault;
    event StrategyAdded(address indexed strategy, uint256 allocation);
    event StrategyRemoved(address indexed strategy, uint256 index);
    event StrategyUpdated(address indexed strategy, uint256 newAllocation);
    event AllocationUpdated(uint256 indexed index, uint256 newAllocation);
    event VaultSet(address indexed vault);
    
    modifier onlyVault() {
        require(msg.sender == vault, "StrategyManager: Only vault");
        _;
    }
    constructor() Ownable(msg.sender) {}

    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "StrategyManager: Invalid vault");
        vault = _vault;
        emit VaultSet(_vault);
    }

    function addStrategy(address _strategy, uint256 _allocation) external onlyOwner {
        require(_strategy != address(0), "StrategyManager: Invalid strategy");
        require(_allocation <= 10000, "StrategyManager: Allocation too high");
        // Check total allocation doesn't exceed 100%
        uint256 totalAllocation = _allocation;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
                totalAllocation += strategies[i].allocation;
            }
        }
        require(totalAllocation <= 10000, "StrategyManager: Total allocation exceeds 100%");
        strategies.push(StrategyInfo({
            strategy: _strategy,
            allocation: _allocation,
            active: true
        }));
        emit StrategyAdded(_strategy, _allocation);
    }

    function removeStrategy(uint256 index) external onlyOwner {
        require(index < strategies.length, "StrategyManager: Invalid index");
        address strategy = strategies[index].strategy;
        strategies[index].active = false;
        strategies[index].allocation = 0;
    emit StrategyRemoved(strategy, index);
    }

    function updateAllocation(uint256 index, uint256 newAllocation) external onlyOwner {
        require(index < strategies.length, "StrategyManager: Invalid index");
        require(newAllocation <= 10000, "StrategyManager: Allocation too high");
        require(strategies[index].active, "StrategyManager: Strategy not active");
        // Check total allocation doesn't exceed 100%
        uint256 totalAllocation = newAllocation;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (i != index && strategies[i].active) {
                totalAllocation += strategies[i].allocation;
            }
        }
        require(totalAllocation <= 10000, "StrategyManager: Total allocation exceeds 100%");
        strategies[index].allocation = newAllocation;
        emit AllocationUpdated(index, newAllocation);
        emit StrategyUpdated(strategies[index].strategy, newAllocation);
    }

    function getActiveStrategies() external view returns (StrategyInfo[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) activeCount++;
        }
        StrategyInfo[] memory activeStrategies = new StrategyInfo[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
            activeStrategies[index] = strategies[i];
            index++;
            }
        }
        return activeStrategies;
    }

    function getTotalAllocation() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].active) {
            total += strategies[i].allocation;
            }
        }
        return total;
    }

    function getStrategyCount() external view returns (uint256) {
        return strategies.length;
    }

    function getStrategy(uint256 index) external view returns (address strategy, uint256 allocation, bool active)
    {
        require(index < strategies.length, "StrategyManager: Invalid index");
        StrategyInfo memory info = strategies[index];
        return (info.strategy, info.allocation, info.active);
    }
}