import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAccount } from "wagmi";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { useState } from "react";

import VUSDT_ABI from "../abis/vUSDTAbi.json";
import YIELD_VAULT_ABI from "../abis/YieldVaultAbi.json";
import STRATEGY_MANAGER_ABI from "../abis/StrategyManagerAbi.json";
import LENDING_STRATEGY_ABI from "../abis/LendingStrategyAbi.json";
import LIQUIDITY_STRATEGY_ABI from "../abis/LiquidityStrategyAbi.json";
import STAKING_STRATEGY_ABI from "../abis/StakingStrategyAbi.json";
import { config } from "@/config/config";
import { Button } from "@heroui/button";
import { formatUnits } from "viem";

export default function Testing() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Display states
  const [vusdtBalance, setVusdtBalance] = useState<string | null>(null);
  const [strategyAssets, setStrategyAssets] = useState<{
    lending: string | null;
    staking: string | null;
    liquidity: string | null;
  }>({ lending: null, staking: null, liquidity: null });
  const [vaultStats, setVaultStats] = useState<any>(null);
  const [strategyInfo, setStrategyInfo] = useState<any>(null);
  const [flexBalance, setFlexBalance] = useState<any>(null);
  const [vaultDetails, setVaultDetails] = useState<any>(null);
  const [apy , setApy] = useState<string | null>(null);
  const [flexCoin , setFlexCoin] = useState<string | null>(null);
  const [AmountInStrategy , setAmountInStrategy] = useState<string | null>(null);

  const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS as `0x${string}`;
  const YIELD_VAULT_ADDRESS = import.meta.env
    .VITE_YIELD_VAULT_ADDRESS as `0x${string}`;
  const STRATEGY_MANAGER_ADDRESS = import.meta.env
    .VITE_STRATEGY_MANAGER_ADDRESS as `0x${string}`;
  const LENDING_STRATEGY_ADDRESS = import.meta.env
    .VITE_LENDING_STRATEGY_ADDRESS as `0x${string}`;
  const LIQUIDITY_STRATEGY_ADDRESS = import.meta.env
    .VITE_LIQUIDITY_STRATEGY_ADDRESS as `0x${string}`;
  const STAKING_STRATEGY_ADDRESS = import.meta.env
    .VITE_STAKING_STRATEGY_ADDRESS as `0x${string}`;

  const handleAirdrop = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);
      setIsSuccess(false);

      const hasClaimed = (await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "hasClaimed",
        args: [address],
      })) as boolean;

      if (hasClaimed) {
        setError("You have already claimed your airdrop!");
        return;
      }

      const tx = await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "airdrop",
      });

      setHash(tx);

      const receipt = await waitForTransactionReceipt(config, { hash: tx });

      if (receipt.status === "success") {
        setIsSuccess(true);
      } else {
        setError("Airdrop transaction failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Airdrop failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadBalances = async () => {
    if (!address) return;
    try {
      const balance = (await readContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      setVusdtBalance(formatUnits(balance, 18));
      console.log("vUSDT Balance:", balance);
    } catch (err) {
      console.error("Failed to load balances:", err);
      setError("Failed to load balances");
    }
  };

  const getLendingStrategy = async () => {
    try {
      const lendingStrategyAssets = (await readContract(config, {
        address: LENDING_STRATEGY_ADDRESS,
        abi: LENDING_STRATEGY_ABI,
        functionName: "totalAssets",
        account: address,
      })) as bigint;

      const stakingStrategyAssets = (await readContract(config, {
        address: STAKING_STRATEGY_ADDRESS,
        abi: STAKING_STRATEGY_ABI,
        functionName: "totalAssets",
        account: address,
      })) as bigint;

      const liquidityStrategyAssets = (await readContract(config, {
        address: LIQUIDITY_STRATEGY_ADDRESS,
        abi: LIQUIDITY_STRATEGY_ABI,
        functionName: "totalAssets",
        account: address,
      })) as bigint;

      setStrategyAssets({
        lending: formatUnits(lendingStrategyAssets, 18),
        staking: formatUnits(stakingStrategyAssets, 18),
        liquidity: formatUnits(liquidityStrategyAssets, 18),
      });

      console.log("Lending Strategy Total Assets:", lendingStrategyAssets);
      console.log("Staking Strategy Total Assets:", stakingStrategyAssets);
      console.log("Liquidity Strategy Total Assets:", liquidityStrategyAssets);
    } catch (err) {
      console.error("Failed to get Strategy Assets:", err);
      setError("Failed to get strategy assets");
    }
  };

  const mintToStrategy = async () => {
    try {
      setLoading(true);
      const lending = await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "mint",
        args: [LENDING_STRATEGY_ADDRESS, 1_000_000n * BigInt(1e18)],
        account: address,
        gas: 12_000_000n,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: lending,
      });
      console.log("Transaction confirmed:", receipt);
      setHash(lending);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to mint to strategy:", err);
      setError("Failed to mint to strategy");
    } finally {
      setLoading(false);
    }
  };

  const mintToPirkya = async () => {
    try {
      setLoading(true);
      const txHash = await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "mint",
        args: [
          "0xD462730DB95340839617473f0D952dfBF2bf2006",
          5_000_000n * BigInt(1e18),
        ],
        account: address,
        gas: 12_000_000n,
      });

      console.log("Mint to Pirkya tx:", txHash);
      const receipt = await waitForTransactionReceipt(config, { hash: txHash });
      console.log("Transaction confirmed:", receipt);
      setHash(txHash);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to mint to Pirkya:", err);
      setError("Failed to mint to Pirkya");
    } finally {
      setLoading(false);
    }
  };

  const rebalance = async () => {
    try {
      setLoading(true);
      const txHash = await writeContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "rebalance",
        account: address,
        gas: 12_000_000n,
      });

      console.log("Rebalance tx:", txHash);
      const receipt = await waitForTransactionReceipt(config, { hash: txHash });
      console.log("Transaction confirmed:", receipt);
      setHash(txHash);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to rebalance:", err);
      setError("Failed to rebalance");
    } finally {
      setLoading(false);
    }
  };

  const harvestAll = async () => {
    try {
      setLoading(true);
      const txHash = await writeContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "harvestAll",
        account: address,
        gas: 12_000_000n,
      });

      console.log("Harvest tx:", txHash);
      const receipt = await waitForTransactionReceipt(config, { hash: txHash });
      console.log("Transaction confirmed:", receipt);
      setHash(txHash);
      setIsSuccess(true);
    } catch (err) {
      console.error("Failed to harvest:", err);
      setError("Failed to harvest");
    } finally {
      setLoading(false);
    }
  };

  const getVaultStats = async () => {
    try {
      const totalAssets = await readContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "getVaultStats",
        account: address,
      });

      setVaultStats(totalAssets);
      console.log("Yield Vault Total Assets:", totalAssets);
    } catch (err) {
      console.error("Failed to get Vault Stats:", err);
      setError("Failed to get vault stats");
    }
  };

  const getStratInfo = async () => {
    try {
      const stratInfo = await readContract(config, {
        address: STRATEGY_MANAGER_ADDRESS,
        abi: STRATEGY_MANAGER_ABI,
        functionName: "getStrategy",
        args: [1],
        account: address,
      });

      setStrategyInfo(stratInfo);
      console.log("Strategy Info:", stratInfo);
    } catch (err) {
      console.error("Failed to get Strategy Info:", err);
      setError("Failed to get strategy info");
    }
  };

  const insighBalanceFunc = async () => {
    if (!address) return;
    try {
      const flexBalance = (await readContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      setFlexBalance(flexBalance);
      console.log("FLEX Balance:", formatUnits(flexBalance, 18));
    } catch (err) {
      console.error("Failed to get FLEX balance:", err);
      setError("Failed to get FLEX balance");
    }
  };

  const getVaultDetails = async () => {
    try {
      const [
        totalAssets,
        vaultStats,
        strategyBalances,
        strategyAPYs,
        estimatedAPY,
        interval,
        perfFee,
        withdrawFee,
        feeRecipient,
        lastReb,
        totalDep,
        totalWdr,
      ] = await Promise.all([
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "totalAssets",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "getVaultStats",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "getStrategyBalances",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "getStrategyAPYs",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "estimatedVaultAPY",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "rebalanceInterval",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "performanceFee",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "withdrawalFee",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "feeRecipient",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "lastRebalance",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "totalDeposited",
        }),
        readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: YIELD_VAULT_ABI,
          functionName: "totalWithdrawn",
        }),
      ]);

      setVaultDetails({
        totalAssets: formatUnits(totalAssets as bigint, 18),
        vaultStats,
        strategyBalances,
        strategyAPYs,
        estimatedAPY,
        interval,
        perfFee,
        withdrawFee,
        feeRecipient,
        lastReb,
        totalDep,
        totalWdr,
      });
    } catch (err) {
      console.error("Failed to fetch vault details:", err);
      setError("Failed to load vault view data");
    }
  };

  const reedem = async () => {
    if(!address) return ;
    try {
      const txn = await writeContract(config, {
        address: YIELD_VAULT_ADDRESS,
        abi: YIELD_VAULT_ABI,
        functionName: "redeem",
        args: [10*1e18, address , address],
        account: address,
        gas: 12_000_000n,
      });

      console.log("Redeem tx:", txn);
      const receipt = await waitForTransactionReceipt(config, { hash: txn });
      console.log("Transaction confirmed:", receipt);
    } catch (e){
      console.error("Failed to redeem vUSDT" , e);
    }
  }

  const paisaHaiKya = async() => {
    if(!address) return ;
    try {
      const amountInStrategy = await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "balanceOf",
        args: ["0x7083674E2355799D333ECeE17E7670e594203f3d"],
      });

      console.log("Amount in strategy:", amountInStrategy);
    } catch (error) {
      console.error("Failed to fetch amount in strategy:", error);
    }
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 mt-26">
        <h1 className={title()}>Dev Page</h1>
        <h3>{address || "Connect your wallet"}</h3>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={handleAirdrop}
            disabled={!address || loading}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Airdrop USDT to Me"}
          </button>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {isSuccess && hash && (
            <div className="p-4 bg-green-100 dark:bg-green-950 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded">
              <strong>Success!</strong>
              <br />
              <span className="text-sm break-all">
                Transaction Hash: {hash}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-4xl mt-8">
          <Button onClick={insighBalanceFunc} disabled={!address || loading}>
            INSIGH balance
          </Button>

          <Button onClick={loadBalances} disabled={!address || loading}>
            Load Balances
          </Button>

          <Button onClick={getLendingStrategy} disabled={!address || loading}>
            Get All Total Assets
          </Button>

          <Button onClick={rebalance} disabled={!address || loading}>
            Rebalance
          </Button>

          <Button onClick={harvestAll} disabled={!address || loading}>
            Harvest All
          </Button>

          <Button onClick={mintToStrategy} disabled={!address || loading}>
            Mint to Strategies
          </Button>

          <Button onClick={mintToPirkya} disabled={!address || loading}>
            Mint to Me
          </Button>

          <Button onClick={getVaultStats} disabled={!address || loading}>
            Get Vault Stats
          </Button>

          <Button onClick={getStratInfo} disabled={!address || loading}>
            Get Strategy Info
          </Button>

          <Button onClick={getVaultDetails} disabled={!address || loading}>
            Get Vault View Data
          </Button>

          <Button onClick={reedem} disabled={!address || loading}>
            Redeem 100 vUSDT
          </Button>

          <Button onClick={paisaHaiKya} disabled={!address || loading}>
            Amount in Strategy
          </Button>
        </div>

        {/* Display Section */}

        <div className="w-full max-w-4xl mt-8 space-y-4">
          {flexBalance && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
              <h3 className="font-bold text-lg mb-2">FLEX Balance</h3>
              <p className="text-2xl font-mono">
                {formatUnits(flexBalance, 18)} FLEX
              </p>
            </div>
          )}

          {vusdtBalance && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Vault Balance</h3>
              <p className="text-2xl font-mono">
                {parseFloat(vusdtBalance).toLocaleString()} vUSDT
              </p>
            </div>
          )}

          {(strategyAssets.lending ||
            strategyAssets.staking ||
            strategyAssets.liquidity) && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Strategy Assets</h3>
              <div className="space-y-2">
                {strategyAssets.lending && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Lending:</span>
                    <span className="font-mono">
                      {parseFloat(strategyAssets.lending).toLocaleString()} USDT
                    </span>
                  </div>
                )}
                {strategyAssets.staking && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Staking:</span>
                    <span className="font-mono">
                      {parseFloat(strategyAssets.staking).toLocaleString()} USDT
                    </span>
                  </div>
                )}
                {strategyAssets.liquidity && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Liquidity:</span>
                    <span className="font-mono">
                      {parseFloat(strategyAssets.liquidity).toLocaleString()}{" "}
                      USDT
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {vaultStats && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Vault Statistics</h3>
              <pre className="bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(
                  vaultStats,
                  (key, value) =>
                    typeof value === "bigint" ? value.toString() : value,
                  2
                )}
              </pre>
            </div>
          )}

          {strategyInfo && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Strategy Info</h3>
              <pre className="bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(
                  strategyInfo,
                  (key, value) =>
                    typeof value === "bigint" ? value.toString() : value,
                  2
                )}
              </pre>
            </div>
          )}

          {vaultDetails && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm space-y-3 w-full max-w-4xl">
              <h3 className="font-bold text-xl mb-4 text-center">
                📊 Vault Overview
              </h3>

              {/* --- BASIC INFO --- */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total Assets:</strong>{" "}
                  {Number(vaultDetails.totalAssets).toFixed(6)}
                </div>
                <div>
                  <strong>Estimated APY:</strong>{" "}
                  {vaultDetails.estimatedAPY
                    ? `${vaultDetails.estimatedAPY}%`
                    : "N/A"}
                </div>
                <div>
                  <strong>Interval:</strong> {vaultDetails.interval?.toString()}{" "}
                  sec
                </div>
                <div>
                  <strong>Performance Fee:</strong>{" "}
                  {Number(vaultDetails.perfFee) / 100}%
                </div>
                <div>
                  <strong>Withdraw Fee:</strong>{" "}
                  {Number(vaultDetails.withdrawFee) / 100}%
                </div>
                <div>
                  <strong>Fee Recipient:</strong> {vaultDetails.feeRecipient}
                </div>
                <div>
                  <strong>Last Rebalance:</strong>{" "}
                  {new Date(
                    Number(vaultDetails.lastReb) * 1000
                  ).toLocaleString()}
                </div>
                <div>
                  <strong>Total Deposited:</strong>{" "}
                  {(Number(vaultDetails.totalDep) / 1e18).toFixed(2)} USDT
                </div>
                <div>
                  <strong>Total Withdrawn:</strong>{" "}
                  {(Number(vaultDetails.totalWdr) / 1e18).toFixed(2)} USDT
                </div>
              </div>

              {/* --- VAULT STATS --- */}
              <div>
                <h4 className="font-semibold mb-2 mt-4">Vault Stats:</h4>
                <ul className="list-disc list-inside text-xs md:text-sm space-y-1">
                  {vaultDetails.vaultStats?.map((v: any, i: number) => (
                    <li key={i}>{v.toString()}</li>
                  ))}
                </ul>
              </div>

              {/* --- STRATEGY BALANCES --- */}
              <div>
                <h4 className="font-semibold mb-2 mt-4">Strategy Balances:</h4>
                {vaultDetails.strategyBalances && (
                  <div className="space-y-2 text-xs md:text-sm">
                    {vaultDetails.strategyBalances[0].map(
                      (addr: string, i: number) => (
                        <div
                          key={addr}
                          className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1"
                        >
                          <span>{addr}</span>
                          <span>
                            {(
                              Number(vaultDetails.strategyBalances[1][i]) / 1e18
                            ).toFixed(6)}{" "}
                            USDT
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* --- STRATEGY APYs --- */}
              <div>
                <h4 className="font-semibold mb-2 mt-4">Strategy APYs:</h4>
                {vaultDetails.strategyAPYs && (
                  <div className="space-y-2 text-xs md:text-sm">
                    {vaultDetails.strategyAPYs[0].map(
                      (addr: string, i: number) => (
                        <div
                          key={addr}
                          className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1"
                        >
                          <span>{addr}</span>
                          <span>
                            {vaultDetails.strategyAPYs[1][i]
                              ? `${Number(vaultDetails.strategyAPYs[1][i]) / 100}%`
                              : "N/A"}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}