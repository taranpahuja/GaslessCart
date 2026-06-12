"use client";
import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export default function Home() {
  // 1. Hook into Privy's MPC wallet state
  const { login, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  // Find the embedded wallet Privy just created for the user
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );

  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);
  const [merchantUSDC, setMerchantUSDC] = useState(0);

  const merchantAddress = "0x3333333333333333333333333333333333333333";
  const userAddress = embeddedWallet ? embeddedWallet.address : "Not connected";

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const handleGaslessCheckout = async () => {
    if (!embeddedWallet) return;

    try {
      setStatus("Processing");
      setLogs([]);

      addLog(
        `Authenticated via Privy. Securing MPC wallet shard for ${userAddress}`,
      );
      addLog("Initializing Phase 2 Checkout Sequence...");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      addLog("Step 1: Compiling EIP-2612 Permit Data Structure...");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog("Step 2: Requesting User Signature via Privy Embedded Wallet...");

      // In production, this is where we call embeddedWallet.signTypedData(...)
      // and pass the resulting signature to our Next.js API relayer.
      addLog("User successfully signed EIP-712 payload using local MPC shard.");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog(
        "Step 3: Routing signature payload to Backend Relayer for gas sponsorship...",
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog(
        "Step 4: Relayer executed GaslessCartPaymaster.executeGaslessPurchase()",
      );

      setMerchantUSDC(50);
      setStatus("Success");
      addLog(
        "Transaction mined successfully on Base! Product purchased with zero gas.",
      );
    } catch (error) {
      addLog(`Error during checkout: ${error.message}`);
      setStatus("Error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-gray-800 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              GaslessCart Storefront
            </h1>
            <p className="text-gray-400 mt-2">
              Next-Gen E-commerce powered by Privy MPC & Paymasters.
            </p>
          </div>

          {/* Dynamic Login/Logout Button */}
          {!authenticated ? (
            <button
              onClick={login}
              className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200"
            >
              Log In
            </button>
          ) : (
            <div className="text-right">
              <span className="text-xs text-gray-400 block">
                Logged in via {user?.email?.address || "Social"}
              </span>
              <span className="text-sm font-mono text-emerald-400">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
            </div>
          )}
        </div>

        {/* Product Display Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-full md:w-1/3 h-48 md:h-auto flex items-center justify-center text-xl font-bold">
            [Product Image]
          </div>
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-bold">
                Web3 Developer Hooded Sweatshirt
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Premium double-knit cotton thread optimizing compilation focus
                aesthetics.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-semibold">
                  Price
                </span>
                <span className="text-2xl font-black text-white">
                  $50.00 <span className="text-xs text-gray-400">USDC</span>
                </span>
              </div>

              {/* Contextual Checkout Button */}
              {!authenticated ? (
                <button
                  onClick={login}
                  className="px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg bg-white text-black hover:bg-gray-200"
                >
                  Login to Buy
                </button>
              ) : (
                <button
                  onClick={handleGaslessCheckout}
                  disabled={status === "Processing"}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    status === "Processing"
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {status === "Processing"
                    ? "Processing Order..."
                    : "Gasless Secure Checkout"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-black rounded-xl border border-gray-800 p-5 font-mono text-xs space-y-2">
          <div className="text-gray-400 font-bold border-b border-gray-900 pb-2 flex justify-between">
            <span>NETWORK TRANSACTION FLOW NODE CONSOLE</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded ${
                status === "Success"
                  ? "bg-emerald-950 text-emerald-400"
                  : status === "Processing"
                    ? "bg-amber-950 text-amber-400"
                    : "bg-gray-900 text-gray-500"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pt-2">
            {logs.length === 0 ? (
              <span className="text-gray-600 italic">
                No network events recorded. Initiate checkout above to stream
                blocks...
              </span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
