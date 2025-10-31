import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { waitForTransactionReceipt, writeContract, readContract } from "@wagmi/core";
import { config } from "@/config/config";
import YieldVaultAbi from "../abis/YieldVaultAbi.json";
import LendingStrategyAbi from "../abis/LendingStrategyAbi.json";
import StakingStrategyAbi from "../abis/StakingStrategyAbi.json";
import LiquidityStrategyAbi from "../abis/LiquidityStrategyAbi.json";
import { parseUnits } from "ethers/lib/utils";
import vUSDTAbi from "../abis/vUSDTAbi.json";
import { useAccount } from "wagmi";

export default function DocsPage() {

  const YIELD_VAULT_ADDRESS = import.meta.env.VITE_YIELD_VAULT_ADDRESS; // Replace with actual address
  const LENDING_STRATEGY_ADDRESS = import.meta.env.VITE_LENDING_STRATEGY_ADDRESS; // Replace with actual address
  const STAKIING_STRATEGY_ADDRESS = import.meta.env.VITE_STAKING_STRATEGY_ADDRESS; // Replace with actual address
  const LIQUIDITY_STRATEGY_ADDRESS = import.meta.env.VITE_LIQUIDITY_STRATEGY_ADDRESS; // Replace with actual address
  const VUSDTADDRESS = import.meta.env.VITE_VUSDT_ADDRESS; // Replace with actual address

  const { address } = useAccount();

  const handleRebalance = async () => {
    // Logic for rebalancing the pool
    try {
      const tx = await writeContract( config,{
        address: YIELD_VAULT_ADDRESS,
        abi: YieldVaultAbi,
        functionName: "rebalance",
        args: [],
      });

      const receipt = await waitForTransactionReceipt(config, { 
        hash: tx,
        timeout: 60000
       });

       console.log("Rebalance transaction confirmed:", receipt);

      console.log("Rebalance transaction submitted:", tx);
    } catch (error) {
      console.error("Error submitting rebalance transaction:", error);
    }
  };

  const getTotalAssets = async () => {
    try{
          const lendingAssets = await readContract( config,{
            address: LENDING_STRATEGY_ADDRESS,
            abi: LendingStrategyAbi,
            functionName: "totalAssets",
            args: [],
          }) as Promise<number>;

      console.log("Total Assets in Lending:", lendingAssets.toString());

      const stakingAssets = await readContract( config,{
        address: STAKIING_STRATEGY_ADDRESS,
        abi: StakingStrategyAbi,
        functionName: "totalAssets",
        args: [],
      }) as Promise<number>;

      console.log("Total Assets in Staking:", stakingAssets.toString());

      const liquidityAssets = await readContract( config,{
        address: LIQUIDITY_STRATEGY_ADDRESS,
        abi: LiquidityStrategyAbi,
        functionName: "totalAssets",
        args: [],
      }) as Promise<number>;

      console.log("Total Assets in Liquidity:", liquidityAssets.toString());

    }

    catch(error){
      console.error("Error reading total assets:", error);
    }
  }

  const getPoolApy = async () => {
    try{
      const lendingAPY = await readContract( config,{
        address: LENDING_STRATEGY_ADDRESS,
        abi: LendingStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      }) as BigInt;

      console.log("Pool APY:", (Number(lendingAPY) / 100).toString() + "%");

      const liquidityAPY = await readContract( config,{
        address: LIQUIDITY_STRATEGY_ADDRESS,
        abi: LiquidityStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      }) as BigInt;

      console.log("Pool APY:", (Number(liquidityAPY) / 100).toString() + "%");

      const stakingAPY = await readContract( config,{
        address: STAKIING_STRATEGY_ADDRESS,
        abi: StakingStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      }) as BigInt;

      console.log("Pool APY:", (Number(stakingAPY) / 100).toString() + "%");

    }

    catch(error){
      console.error("Error reading pool APY:", error);
    }
  }

  const mintToYieldVault = async () => {
    try {
      const tx = await writeContract(config, {
        address: VUSDTADDRESS,
        abi: vUSDTAbi,
        functionName: "mint",
        args: [YIELD_VAULT_ADDRESS, 100_000_000 * 1e18],
        gas: 1_200_000n,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        timeout: 60000,
      });

      console.log("Mint to Vaults transaction confirmed:", receipt);
    } catch (error) {
      console.error("Error submitting Mint to Vaults transaction:", error);
    }
  };

  const redeemShares = async () => {
    try {
      const tx = await writeContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YieldVaultAbi,
        functionName: "redeem",
        args: [parseUnits("500", 18), address, address],
        gas: 1_200_000n,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: tx,
        timeout: 60000,
      });

      console.log("Redeem transaction confirmed:", receipt);
    } catch (error) {
      console.error("Error submitting Redeem transaction:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Price</h1>
        </div>
        <Button onPress={handleRebalance} size="lg" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white ">
          Rebalance
        </Button>

        <Button onPress={getTotalAssets} size="lg" className="mt-6 bg-green-600 hover:bg-green-700 text-white ">
          Get Total Assets
        </Button>

        <Button onPress={getPoolApy} size="lg" className="mt-6 bg-gray-600 hover:bg-gray-700 text-white ">
          View Pool APY
        </Button>
        
        <Button onPress={redeemShares} size="lg" className="mt-6 bg-gray-600 hover:bg-gray-700 text-white ">
          Redeem
        </Button>

         <Button onPress={mintToYieldVault} size="lg" className="mt-6 bg-red-600 hover:bg-red-700 text-white ">
          Mint to Vaults
        </Button>


      </section>
    </DefaultLayout>
  );
}

