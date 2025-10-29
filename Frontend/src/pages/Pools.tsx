import { useEffect, useState } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { readContract } from "wagmi/actions";
import { config } from "@/config/config";
import YieldVaultAbi from "../abis/YieldVaultAbi.json";
import LendingStrategyAbi from "../abis/LendingStrategyAbi.json";
import StakingStrategyAbi from "../abis/StakingStrategyAbi.json";
import LiquidityStrategyAbi from "../abis/LiquidityStrategyAbi.json";
import { formatUnits } from "viem";
import { BarChart3, TrendingUp, Zap, Loader } from "lucide-react";

export default function PoolsPage() {
  const [poolData, setPoolData] = useState({
    lending: { assets: "0", apy: "0" },
    staking: { assets: "0", apy: "0" },
    liquidity: { assets: "0", apy: "0" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const YIELD_VAULT_ADDRESS = import.meta.env.VITE_YIELD_VAULT_ADDRESS as `0x${string}`;
  const LENDING_STRATEGY_ADDRESS = import.meta.env.VITE_LENDING_STRATEGY_ADDRESS as `0x${string}`;
  const STAKING_STRATEGY_ADDRESS = import.meta.env.VITE_STAKING_STRATEGY_ADDRESS as `0x${string}`;
  const LIQUIDITY_STRATEGY_ADDRESS = import.meta.env.VITE_LIQUIDITY_STRATEGY_ADDRESS as `0x${string}`;

  useEffect(() => {
    fetchPoolData();
  }, []);

  const fetchPoolData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch Lending Strategy
      const lendingAssets = (await readContract(config, {
        address: LENDING_STRATEGY_ADDRESS,
        abi: LendingStrategyAbi,
        functionName: "totalAssets",
        args: [],
      })) as bigint;

      const lendingAPY = (await readContract(config, {
        address: LENDING_STRATEGY_ADDRESS,
        abi: LendingStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      })) as bigint;

      // Fetch Staking Strategy
      const stakingAssets = (await readContract(config, {
        address: STAKING_STRATEGY_ADDRESS,
        abi: StakingStrategyAbi,
        functionName: "totalAssets",
        args: [],
      })) as bigint;

      const stakingAPY = (await readContract(config, {
        address: STAKING_STRATEGY_ADDRESS,
        abi: StakingStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      })) as bigint;

      // Fetch Liquidity Strategy
      const liquidityAssets = (await readContract(config, {
        address: LIQUIDITY_STRATEGY_ADDRESS,
        abi: LiquidityStrategyAbi,
        functionName: "totalAssets",
        args: [],
      })) as bigint;

      const liquidityAPY = (await readContract(config, {
        address: LIQUIDITY_STRATEGY_ADDRESS,
        abi: LiquidityStrategyAbi,
        functionName: "estimatedAPY",
        args: [],
      })) as bigint;

      setPoolData({
        lending: {
          assets: parseFloat(formatUnits(lendingAssets, 18)).toFixed(2),
          apy: (Number(lendingAPY) / 100).toFixed(2),
        },
        staking: {
          assets: parseFloat(formatUnits(stakingAssets, 18)).toFixed(2),
          apy: (Number(stakingAPY) / 100).toFixed(2),
        },
        liquidity: {
          assets: parseFloat(formatUnits(liquidityAssets, 18)).toFixed(2),
          apy: (Number(liquidityAPY) / 100).toFixed(2),
        },
      });

      console.log("Pool data fetched successfully");
    } catch (error) {
      console.error("Error fetching pool data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Loading Skeleton
  const SkeletonCard = () => (
    <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-6 w-24 bg-gray-800 rounded"></div>
          <div className="h-4 w-20 bg-gray-800 rounded"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="h-4 w-24 bg-gray-800 rounded mb-2"></div>
          <div className="h-8 w-32 bg-gray-800 rounded"></div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="h-4 w-24 bg-gray-800 rounded mb-2"></div>
          <div className="h-8 w-32 bg-gray-800 rounded"></div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <div className="h-4 w-28 bg-gray-800 rounded mb-2"></div>
          <div className="h-6 w-40 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Initial Loading Screen
  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-950 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 mt-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                  <BarChart3 className="w-7 h-7 text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">Pools</h1>
              </div>
              <p className="text-gray-400 text-lg">Monitor strategy performance and asset allocation</p>
            </div>

            {/* Loading Animation */}
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-gray-400 text-lg">Loading pool data...</p>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            {/* Summary Skeleton */}
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 animate-pulse">
              <div className="h-6 w-40 bg-gray-800 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-800 rounded"></div>
                  <div className="h-8 w-40 bg-gray-800 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-800 rounded"></div>
                  <div className="h-8 w-40 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-950 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 mt-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                <BarChart3 className="w-7 h-7 text-blue-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Pools</h1>
            </div>
            <p className="text-gray-400 text-lg">Monitor strategy performance and asset allocation</p>
          </div>

          {/* Pool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Lending Strategy Card */}
            <div className={`bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-blue-700/50 transition-all ${isRefreshing ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Lending</h2>
                  <p className="text-sm text-gray-400">Strategy Pool</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Assets</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {poolData.lending.assets}
                    <span className="text-lg text-gray-400 ml-2">vUSDT</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Current APY</p>
                  <p className="text-3xl font-bold text-blue-300">
                    {poolData.lending.apy}
                    <span className="text-lg text-gray-400 ml-2">%</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">Est. Annual Return</p>
                  <p className="text-lg font-semibold text-blue-300 mt-1">
                    {(Number(poolData.lending.assets) * Number(poolData.lending.apy) / 100).toFixed(2)} vUSDT
                  </p>
                </div>
              </div>
            </div>

            {/* Staking Strategy Card */}
            <div className={`bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-emerald-700/50 transition-all ${isRefreshing ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-emerald-700/50">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Staking</h2>
                  <p className="text-sm text-gray-400">Strategy Pool</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Assets</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {poolData.staking.assets}
                    <span className="text-lg text-gray-400 ml-2">vUSDT</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Current APY</p>
                  <p className="text-3xl font-bold text-emerald-300">
                    {poolData.staking.apy}
                    <span className="text-lg text-gray-400 ml-2">%</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">Est. Annual Return</p>
                  <p className="text-lg font-semibold text-emerald-300 mt-1">
                    {(Number(poolData.staking.assets) * Number(poolData.staking.apy) / 100).toFixed(2)} vUSDT
                  </p>
                </div>
              </div>
            </div>

            {/* Liquidity Strategy Card */}
            <div className={`bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-amber-700/50 transition-all ${isRefreshing ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center border border-amber-700/50">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Liquidity</h2>
                  <p className="text-sm text-gray-400">Strategy Pool</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Total Assets</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {poolData.liquidity.assets}
                    <span className="text-lg text-gray-400 ml-2">vUSDT</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Current APY</p>
                  <p className="text-3xl font-bold text-amber-300">
                    {poolData.liquidity.apy}
                    <span className="text-lg text-gray-400 ml-2">%</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500">Est. Annual Return</p>
                  <p className="text-lg font-semibold text-amber-300 mt-1">
                    {(Number(poolData.liquidity.assets) * Number(poolData.liquidity.apy) / 100).toFixed(2)} vUSDT
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className={`bg-gray-900 rounded-xl p-8 border border-gray-800 mb-6 ${isRefreshing ? 'opacity-60' : ''}`}>
            <h3 className="text-xl font-bold text-white mb-6">Portfolio Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Assets Under Management</p>
                <p className="text-3xl font-bold text-white">
                  {(Number(poolData.lending.assets) + Number(poolData.staking.assets) + Number(poolData.liquidity.assets)).toFixed(2)}
                  <span className="text-lg text-gray-400 ml-2">vUSDT</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Weighted Average APY</p>
                <p className="text-3xl font-bold text-white">
                  {(
                    (Number(poolData.lending.assets) * Number(poolData.lending.apy) +
                      Number(poolData.staking.assets) * Number(poolData.staking.apy) +
                      Number(poolData.liquidity.assets) * Number(poolData.liquidity.apy)) /
                    (Number(poolData.lending.assets) + Number(poolData.staking.assets) + Number(poolData.liquidity.assets))
                  ).toFixed(2)}
                  <span className="text-lg text-gray-400 ml-2">%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <div className="flex justify-center">
              <Button
                onPress={fetchPoolData}
                disabled={isRefreshing}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Refreshing...</span>
                  </div>
                ) : (
                  "Refresh Pool Data"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}