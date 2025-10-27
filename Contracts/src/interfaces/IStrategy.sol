// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStrategy {

    function asset() external view returns (address);

    function vault() external view returns (address);

    function totalAssets() external view returns (uint256);

    function balanceOf() external view returns (uint256);

    function baseAPY() external view returns (uint256);

    function estimatedAPY() external view returns (uint256);

    function totalHarvested() external view returns (uint256);

    function lastHarvest() external view returns (uint256);

    function deposit(uint256 assets, address receiver) external returns (uint256 shares);

    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);

    function harvest() external returns (uint256 harvestedAmount);

    function withdrawAll() external returns (uint256 totalWithdrawn);

    function setVault(address _vault) external;
}