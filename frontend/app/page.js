"use client";
import { useState } from "react";
import { keccak256, encodePacked } from "viem";

export default function Home() {
  // 1. Local state variables to track the checkout lifecycle
  const [status, setStatus] = useState("Idle");
  const [logs, setLogs] = useState([]);
  const [userUSDC, setUserUSDC] = useState(100);
  const [merchantUSDC, setMerchantUSDC] = useState(0);

  // Simulated addresses for our UI demonstration
  const userAddress = "0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5";
  const merchantAddress = "0x3333333333333333333333333333333333333333";
  const paymasterAddress = "0x7777777777777777777777777777777777777777";

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  // 2. The core gasless purchase simulation logic
  const handleGaslessCheckout = async () => {
    try {
      setStatus("Processing");
      setLogs([]);

      addLog("Initializing gasless checkout sequence...");
      addLog(
        `Checking user gas balance... Found: 0.00 ETH (Classic transactions would fail!)`,
      );

      // Step A: Packaging the parameters
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const itemPrice = 50_000000n; // 50 USDC
      const executionFee = 1_500000n; // 1.50 USDC
      const currentNonce = 0n;
      const chainId = 8453n; // Base Mainnet Id
      addLog(
        "Step 1: Compiled raw purchase structure parameters successfully.",
      );

      // Step B: Cryptographic hashing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const messageHash = keccak256(
        encodePacked(
          ["address", "address", "uint256", "uint256", "uint256", "uint256"],
          [
            userAddress,
            merchantAddress,
            itemPrice,
            executionFee,
            currentNonce,
            chainId,
          ],
        ),
      );
      addLog(`Step 2: Generated local core structural hash: ${messageHash}`);

      // Step C: Mimic backend authorization signature
      await new Promise((resolve) => setTimeout(resolve, 1200));
      addLog(
        "Step 3: Forwarding intent hash to backend validator for secure signing...",
      );
      const mockSignature = "0x4a49c6b8c...a8f2731b71c"; // Simulated signature return
      addLog(`Received verified backend signature: ${mockSignature}`);

      // Step D: Simulate decentralized network execution
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog(
        "Step 4: Broadcaster Relayer intercepted payload. Submitting on-chain transaction...",
      );
      addLog(
        `Relayer paid 0.00004 ETH gas to execute 'GaslessCartPaymaster.executeGaslessPurchase()'`,
      );

      // Update local state balances upon simulated settlement confirmation
      setUserUSDC(48.5); // 100 - 50 (Item) - 1.50 (Gas reimbursement)
      setMerchantUSDC(50);
      setStatus("Success");
      addLog(
        "Transaction mined successfully on Base! Product purchased with zero user gas.",
      );
    } catch (error) {
      addLog(`Error during checkout: ${error.message}`);
      setStatus("Error");
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Block */}
        <div className="border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            GaslessCart Storefront
          </h1>
          <p className="text-gray-400 mt-2">
            Experience friction-free gasless checkout powered by Account
            Abstraction primitives.
          </p>
        </div>

        {/* Dynamic Balance Trackers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-400">
              Shopper Status
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
              {userAddress}
            </p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">USDC Balance:</span>
                <span className="font-bold text-emerald-400">
                  ${userUSDC.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ETH Gas Balance:</span>
                <span className="font-bold text-red-400">$0.00 (0 ETH)</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-sm font-semibold uppercase text-gray-400">
              Merchant Ledger
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
              {merchantAddress}
            </p>
            <div className="mt-4 flex justify-between items-center pt-2">
              <span className="text-gray-400">Earnings Secured:</span>
              <span className="font-bold text-blue-400">
                ${merchantUSDC.toFixed(2)} USDC
              </span>
            </div>
          </div>
        </div>

        {/* Product Display Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-full md:w-1/3 h-48 md:h-auto flex items-center justify-center text-4xl">
            👕
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
            </div>
          </div>
        </div>

        {/* Hardware & Network Node Logs Console */}
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
