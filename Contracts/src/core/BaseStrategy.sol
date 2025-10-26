// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract BaseStrategy is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public vault;
    uint256 public lastHarvest;
    uint256 public totalHarvested;

    uint256 public baseAPY; 
    uint256 public lastYieldUpdate;
    uint256 public accumulatedYield;

    event Harvested(uint256 amount, uint256 timestamp);
    event YieldGenerated(uint256 amount);
    event VaultUpdated(address indexed oldVault, address indexed newVault);

    modifier onlyVault() {
        require(msg.sender == vault, "BaseStrategy: Only vault can call");
        _;
    }

    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        uint256 _baseAPY
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_baseAPY > 0 && _baseAPY < 50000, "BaseStrategy: Invalid APY");
        baseAPY = _baseAPY;
        lastYieldUpdate = block.timestamp;
    }

    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "BaseStrategy: Invalid vault address");
        address oldVault = vault;
        vault = _vault;
        emit VaultUpdated(oldVault, _vault);
    }

    function _generateYield() internal {
        uint256 timeElapsed = block.timestamp - lastYieldUpdate;

        if (timeElapsed > 0 && totalAssets() > 0) {
            uint256 baseYield = (totalAssets() * baseAPY * timeElapsed) / (365 days * 10000);

            uint256 randomSeed = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        address(this)
                    )
                )
            );

            uint256 randomFactor = (randomSeed % 40) + 90;
            uint256 yield = (baseYield * randomFactor) / 100;

            accumulatedYield += yield;
            lastYieldUpdate = block.timestamp;

            emit YieldGenerated(yield);
        }
    }

    function deposit(uint256 assets, address receiver)
        public
        virtual
        override
        onlyVault
        nonReentrant
        returns (uint256)
    {
        _generateYield();
        return super.deposit(assets, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner)
        public
        virtual
        override
        onlyVault
        nonReentrant
        returns (uint256)
    {
        _generateYield();
        return super.withdraw(assets, receiver, owner);
    }

    function totalAssets() public view virtual override returns (uint256) {
        uint256 baseAssets = IERC20(asset()).balanceOf(address(this));

        uint256 timeElapsed = block.timestamp - lastYieldUpdate;
        uint256 pendingYield = 0;

        if (timeElapsed > 0 && baseAssets > 0) {
            uint256 baseYield = (baseAssets * baseAPY * timeElapsed) / (365 days * 10000);

            uint256 randomSeed = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        address(this)
                    )
                )
            );

            uint256 randomFactor = (randomSeed % 40) + 90;
            pendingYield = (baseYield * randomFactor) / 100;
        }

        return baseAssets + accumulatedYield + pendingYield;
    }

    function balanceOf() external view returns (uint256) {
        return totalAssets();
    }

    function harvest() external onlyVault nonReentrant returns (uint256) {
        _generateYield();
        uint256 harvestedAmount = accumulatedYield;

        if (harvestedAmount > 0) {
            totalHarvested += harvestedAmount;
            accumulatedYield = 0;
            lastHarvest = block.timestamp;
            emit Harvested(harvestedAmount, block.timestamp);
        }

        return harvestedAmount;
    }

    function estimatedAPY() external view returns (uint256) {
        uint256 randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    address(this)
                )
            )
        );

        uint256 randomFactor = (randomSeed % 20) + 90;
        return (baseAPY * randomFactor) / 100;
    }

    function withdrawAll() external onlyVault nonReentrant returns (uint256) {
        _generateYield();
        uint256 total = IERC20(asset()).balanceOf(address(this));

        if (total > 0) {
            IERC20(asset()).safeTransfer(vault, total);
        }

        return total;
    }
}
