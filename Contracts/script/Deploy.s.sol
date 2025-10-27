// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "forge-std/Script.sol";
import { vUSDT} from "../src/tokens/vUSDT.sol";
import { StrategyManager} from "../src/core/StrategyManager.sol";
import { YieldVault} from "../src/core/YieldVault.sol";
import { LendingStrategy} from "../src/strategies/LendingStrategy.sol";
import { LiquidityStrategy} from "../src/strategies/LiquidityStrategy.sol";
import { StakingStrategy} from "../src/strategies/StakingStrategy.sol";
/**
 * @title Deploy
 * @notice Deployment script for Yield Aggregator
 * @dev Run with: forge script script/Deploy.s.sol:Deploy --rpc-url <RPC> --broadcast
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("====================================");
        console.log("Deploying Yield Aggregator V1");
        console.log("====================================\n");
        
        // 1. Deploy Mock vUSDT
        console.log("1. Deploying Mock vUSDT...");
        vUSDT vUsdt = new vUSDT();
        console.log("   vUSDT deployed at:", address(vUsdt));
        console.log("   Initial supply:", vUsdt.totalSupply() / 1e18, "vUSDT\n");
        
        // 2. Deploy Strategy Manager
        console.log("2. Deploying Strategy Manager...");
        StrategyManager strategyManager = new StrategyManager();
        console.log("   StrategyManager deployed at:", address(strategyManager));
        console.log("");
        
        // 3. Deploy Strategies
        console.log("3. Deploying Strategies...");
        
        LendingStrategy lendingStrategy = new LendingStrategy(vUsdt);
        console.log("   LendingStrategy deployed at:", address(lendingStrategy));
        console.log("   Base APY: 4%");
        
        LiquidityStrategy liquidityStrategy = new LiquidityStrategy(vUsdt);
        console.log("   LiquidityStrategy deployed at:", address(liquidityStrategy));
        console.log("   Base APY: 12%");
        
        StakingStrategy stakingStrategy = new StakingStrategy(vUsdt);
        console.log("   StakingStrategy deployed at:", address(stakingStrategy));
        console.log("   Base APY: 7%\n");
        
        // 4. Deploy Main Vault
        console.log("4. Deploying Main Vault...");
        YieldVault vault = new YieldVault(vUsdt, address(strategyManager));
        console.log("   YieldVault deployed at:", address(vault));
        console.log("   Vault Token: yvUSDT\n");
        
        // 5. Configure Strategy Manager
        console.log("5. Configuring Strategy Manager...");
        strategyManager.setVault(address(vault));
        console.log("   Vault address set");
        
        strategyManager.addStrategy(address(lendingStrategy), 4000); // 40%
        console.log("   LendingStrategy added (40% allocation)");
        
        strategyManager.addStrategy(address(liquidityStrategy), 3000); // 30%
        console.log("   LiquidityStrategy added (30% allocation)");
        
        strategyManager.addStrategy(address(stakingStrategy), 3000); // 30%
        console.log("   StakingStrategy added (30% allocation)\n");
        
        // 6. Configure Strategies
        console.log("6. Configuring Strategies...");
        lendingStrategy.setVault(address(vault));
        liquidityStrategy.setVault(address(vault));
        stakingStrategy.setVault(address(vault));
        console.log("   Vault address set in all strategies\n");
        
        // 7. Summary
        console.log("====================================");
        console.log("Deployment Complete!");
        console.log("====================================");
        console.log("\nContract Addresses:");
        console.log("-----------------------------------");
        console.log("vUSDT:              ", address(vUsdt));
        console.log("StrategyManager:   ", address(strategyManager));
        console.log("YieldVault:        ", address(vault));
        console.log("LendingStrategy:   ", address(lendingStrategy));
        console.log("LiquidityStrategy: ", address(liquidityStrategy));
        console.log("StakingStrategy:   ", address(stakingStrategy));
        console.log("-----------------------------------\n");
        
        console.log("Next Steps:");
        console.log("1. Mint vUSDT to users: vUSDT.mint(address, amount)");
        console.log("2. Users approve vault: vUSDT.approve(vault, amount)");
        console.log("3. Users deposit: vault.deposit(amount, receiver)");
        console.log("4. Monitor yields: vault.estimatedVaultAPY()");
        console.log("5. Harvest: vault.harvestAll()");
        console.log("6. Rebalance: vault.rebalance()\n");
        
        vm.stopBroadcast();
    }
}