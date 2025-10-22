// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVault {
    function userData(address) external view returns (uint256 locked, uint256 available);
    function lockCollateral(address _user, uint256 _amount) external;
    function unlockCollateral(address _user, uint256 _amount) external;
    function vUSDT() external view returns (address);
}