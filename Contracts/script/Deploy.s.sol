// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../lib/forge-std/src/Script.sol";
import { vUSDT } from "../src/core/vUSDT.sol";
import { Vault } from "../src/core/Vault.sol";
import { YieldPool } from "../src/core/YieldPool.sol";
import { YieldRouter } from "../src/core/YieldRouter.sol";

contract Deploy is Script {
    function run() external {
        // Load deployer key (set in .env or manually)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy mock token
        vUSDT vusdt = new vUSDT();
        console.log("vUSDT deployed at:", address(vusdt));

        // 2. Deploy Vault
        Vault vault = new Vault(address(vusdt));
        console.log("Vault deployed at:", address(vault));

        // 3. Deploy Yield Pools
        YieldPool pool1 = new YieldPool(address(vusdt));
        YieldPool pool2 = new YieldPool(address(vusdt));
        YieldPool pool3 = new YieldPool(address(vusdt));
        console.log("YieldPool1:", address(pool1));
        console.log("YieldPool2:", address(pool2));
        console.log("YieldPool3:", address(pool3));

        // 4. Deploy Router
        YieldRouter router = new YieldRouter(address(vault));
        console.log("YieldRouter deployed at:", address(router));

        // 5. Add pools to router
        router.addPool(address(pool1));
        router.addPool(address(pool2));
        router.addPool(address(pool3));

        // 6. Transfer Vault ownership to router (optional if router should control locks)
        vault.transferOwnership(address(router));
        console.log("Vault ownership transferred to router");

        vm.stopBroadcast();
    }
}