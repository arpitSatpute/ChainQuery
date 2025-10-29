import React, { useEffect, useState } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Gift, TrendingUp, Shield } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import DefaultLayout from "@/layouts/default";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config/config";
import vUSDTABI from "../abis/vUSDTAbi.json"
import yieldVaultAbi from "../abis/YieldVaultAbi.json";
import { parseUnits } from "ethers/lib/utils";
import { formatUnits } from "viem";
// import { parse } from "path";

export default function Vault() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [airdropClaimed, setAirdropClaimed] = useState(false);
  const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS as `0x${string}`;
  const YIELD_VAULT_ADDRESS = import.meta.env.VITE_YIELD_VAULT_ADDRESS as `0x${string}`;
  const [hash, setHash] = useState<string | null>(null);
  const [vaultBalance, setVaultBalance] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [vUSDTBalance, setVUSDTBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!address) {
      setAirdropClaimed(false);
      return;
    }

    let mounted = true;

    const fetchBalance = async () => {
      try {
        console.log("Fetching balance for address:", address);
        const balance = await readContract(config, {
          address: VUSDT_ADDRESS,
          abi: vUSDTABI,
          functionName: "balanceOf",
          args: [address],
        }) as bigint;

        const formatted = formatUnits(balance, 18);
        if (mounted) setVUSDTBalance(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchVaultBalance = async () => {
      try {
        console.log("Fetching vault balance");
        const balance = await readContract(config, {
          address: YIELD_VAULT_ADDRESS,
          abi: yieldVaultAbi,
          functionName: "totalAssets",
          args: [],
        }) as bigint;
        setVaultBalance(formatUnits(balance, 18));
        console.log("Vault Balance:", balance);
      }
      catch (err) {
        console.error(err);
      }
    }
    
    const fetchClaimed = async () => {
      try {
        const hasClaimed = await readContract(config, {
          address: VUSDT_ADDRESS,
          abi: vUSDTABI,
          functionName: "hasClaimed",
          args: [address],
        }) as boolean;
        
        if (mounted) setAirdropClaimed(hasClaimed);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchBalance();
    fetchVaultBalance();
    fetchClaimed();

    return () => {
      mounted = false;
    };
  }, [address]);
 
  const handleAirdrop = async () => {
    console.log("Airdrop button clicked");
    if (!address) return;
    
    try {
      const hasClaimed = await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: vUSDTABI,
        functionName: "hasClaimed",
        args: [address],
      }) as boolean;

      if (hasClaimed) {
        setAirdropClaimed(true);
        return;
      }

      const tx = await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: vUSDTABI,
        functionName: "airdrop",
      });

      setHash(tx);
      const receipt = await waitForTransactionReceipt(config, { hash: tx });

      if (receipt.status === "success") {
        setAirdropClaimed(true);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };

  const depositToVault = async () => {
  if (!depositAmount || !address) return;
  
  setIsLoading(true);
  setHash("Approving vUSDT...");
  
  try {
    // Step 1: Approve vUSDT spending
    const approvalAmount = parseUnits(depositAmount, 18);
    
    const approveTx = await writeContract(config, {
      address: VUSDT_ADDRESS,
      abi: vUSDTABI,
      functionName: "approve",
      args: [YIELD_VAULT_ADDRESS, approvalAmount],
    });

    console.log("Approval tx:", approveTx);
    
    const approvalReceipt = await waitForTransactionReceipt(config, { 
      hash: approveTx,
      timeout: 60000,
    });

    if (approvalReceipt.status !== "success") {
      setHash("Approval failed!");
      setIsLoading(false);
      return;
    }

    console.log("Approval successful");
    setHash("Depositing to vault...");

    // Step 2: Deposit to vault
    const depositTx = await writeContract(config, {
      address: YIELD_VAULT_ADDRESS,
      abi: yieldVaultAbi,
      functionName: "deposit",
      args: [approvalAmount, address],
    });

    console.log("Deposit tx:", depositTx);
    setHash(depositTx);

    const depositReceipt = await waitForTransactionReceipt(config, { 
      hash: depositTx,
      timeout: 60000,
    });

    if (depositReceipt.status === "success") {
      setDepositAmount("");
      setHash("✓ Deposit successful!");
      
      // Refetch balances after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setHash("Deposit failed!");
    }
  } catch (err: any) {
    console.error("Deposit error:", err);
    setHash(`✗ Error: ${err?.message || "Transaction failed"}`);
  } finally {
    setIsLoading(false);
  }
};

const withdrawFromVault = async () => {
  if (!withdrawAmount || !address) return;
  
  setIsLoading(true);
  setHash("Processing withdrawal...");
  
  try {
    const withdrawTx = await writeContract(config, {
      address: YIELD_VAULT_ADDRESS,
      abi: yieldVaultAbi,
      functionName: "withdraw",
      args: [parseUnits(withdrawAmount, 18), address, address],
    });

    console.log("Withdraw tx:", withdrawTx);
    setHash(withdrawTx);

    const withdrawReceipt = await waitForTransactionReceipt(config, { 
      hash: withdrawTx,
      timeout: 60000,
    });

    if (withdrawReceipt.status === "success") {
      setWithdrawAmount("");
      setHash("✓ Withdrawal successful!");
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setHash("Withdrawal failed!");
    }
  } catch (err: any) {
    console.error("Withdraw error:", err);
    setHash(`✗ Error: ${err?.message || "Transaction failed"}`);
  } finally {
    setIsLoading(false);
  }
};
  

  if (!isConnected) {
    return (
      <DefaultLayout>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Vault</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to access the vault</p>
            <button onClick={() => connect({ connector: connectors[0] })} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
              Connect Wallet
            </button>
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
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Vault</h1>
          </div>
          <p className="text-gray-400 text-lg">Secure your assets</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-blue-700/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400">Vault Balance</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{parseFloat(vaultBalance).toFixed(2)}</p>
            <p className="text-sm text-gray-500">vUSDT</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-emerald-700/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center border border-emerald-700/50">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-gray-400">Available Balance</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{parseFloat(vUSDTBalance).toFixed(2)}</p>
            <p className="text-sm text-gray-500">vUSDT</p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-amber-700/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center border border-amber-700/50">
                <Gift className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-sm text-gray-400">APY</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">12.5%</p>
            <p className="text-sm text-gray-500">Annual Yield</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Deposit Section */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-blue-700/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-700/50">
                <ArrowDownCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Deposit</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (vUSDT)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-600 text-white text-lg placeholder-gray-600 transition-all"
                  value={depositAmount}
                  onChange={(e) => handleInputChange(e, setDepositAmount)}
                />
              </div>
              <button 
                onClick={depositToVault} 
                disabled={isLoading || !depositAmount}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "Processing..." : "Deposit"}
              </button>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-red-700/50 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-900/30 rounded-lg flex items-center justify-center border border-red-700/50">
                <ArrowUpCircle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Withdraw</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (vUSDT)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-600 text-white text-lg placeholder-gray-600 transition-all"
                  value={withdrawAmount}
                  onChange={(e) => handleInputChange(e, setWithdrawAmount)}
                />
              </div>
              <button onClick={withdrawFromVault} className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {hash && (
          <div className={`p-4 rounded-lg text-center font-medium mb-6 ${
            hash.includes("✗")
              ? "bg-red-900/30 text-red-300 border border-red-700/50"
              : hash.includes("✓")
              ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700/50"
              : "bg-blue-900/30 text-blue-300 border border-blue-700/50"
          }`}>
            {hash}
          </div>
        )}

        {/* Airdrop Section */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 hover:border-purple-700/50 transition-all mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-900/30 rounded-lg flex items-center justify-center border border-purple-700/50">
                <Gift className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Airdrop Rewards</h2>
                <p className="text-gray-400">Claim your free tokens</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-purple-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Available Reward</p>
                <p className="text-3xl font-bold text-white">10000 <span className="text-lg text-gray-400">vUSDT</span></p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold ${
                  airdropClaimed 
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' 
                    : 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                }`}>
                  {airdropClaimed ? '✓ Claimed' : '● Available'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAirdrop}
            disabled={airdropClaimed}
            className="w-full px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {airdropClaimed ? 'Already Claimed' : 'Claim Airdrop'}
          </button>
        </div>
      </div>
    </div>
    </DefaultLayout>
  );
}