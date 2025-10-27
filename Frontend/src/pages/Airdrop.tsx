
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { useState } from "react";

import vUSDTABI from "../abis/vUSDTAbi.json"
// import VaultABI from "../abis/VaultABI.json"



import { config } from "@/config/config";
import { Button } from "@heroui/button";


export default function Airdrop() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS as `0x${string}`;
  const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`;
  
  const handleAirdrop = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      setIsSuccess(false);
      
      // Check if user has already claimed
      const hasClaimed = await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: vUSDTABI,
        functionName: "hasClaimed",
        args: [address],
      }) as boolean;

      if (hasClaimed) {
        setError("You have already claimed your airdrop!");
        return;
      }

      // Execute airdrop transaction
      const tx = await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: vUSDTABI,
        functionName: "airdrop",
      });

      setHash(tx);

      // Wait for transaction confirmation
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

  
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1 className={title()}>Airdrop</h1>
        
        {(!address) ? (
          <Button
            onPress={() => connect({ connector: connectors[0] })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Connect Wallet
          </Button>
        ) : (
          address
        )}

        <div className="flex flex-col gap-4 w-full max-w-md">
          <button
            onClick={handleAirdrop}
            disabled={!address || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Airdrop USDT"}
          </button>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {isSuccess && hash && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <strong>Success!</strong>
              <br />
              Transaction Hash: {hash}
            </div>
          )}
        </div>

        <br />

        {(address) && (
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-dark-600 text-white rounded"
          >
            Disconnect
          </button>
        )}
      </section>
    </DefaultLayout>
  );
}