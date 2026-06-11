import { createWalletClient, http, keccak256, encodePacked } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import "dotenv/config";
// 1. Setup simulated private keys (NEVER expose real keys with funds in code)
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

const userAccount = privateKeyToAccount(USER_PRIVATE_KEY);
const signerAccount = privateKeyToAccount(SIGNER_PRIVATE_KEY);

console.log("--- Initializing Local Web3 Entities ---");
console.log(`User Wallet Address: ${userAccount.address}`);
console.log(`Backend Validator Address: ${signerAccount.address}\n`);

// 2. Define our transaction parameters
const merchantAddress = "0x3333333333333333333333333333333333333333";
const itemPrice = 50_000000n; // 50 USDC (USDC uses 6 decimal places)
const gasFeeReimbursement = 1_500000n; // 1.50 USDC to cover gas costs
const userNonce = 0n; // First transaction from this user
const chainId = BigInt(baseSepolia.id); // Base Sepolia Testnet ID

/**
 * Creates an exact on-chain cryptographic message hash matching our Solidity architecture
 */
function computeTransactionHash(user, merchant, amount, fee, nonce, chain) {
  return keccak256(
    encodePacked(
      ["address", "address", "uint256", "uint256", "uint256", "uint256"],
      [user, merchant, amount, fee, nonce, chain],
    ),
  );
}

async function runGaslessCheckout() {
  console.log("Step 1: Generating cryptographic purchase intent hash...");
  const messageHash = computeTransactionHash(
    userAccount.address,
    merchantAddress,
    itemPrice,
    gasFeeReimbursement,
    userNonce,
    chainId,
  );
  console.log(`Computed Hash: ${messageHash}\n`);

  console.log("Step 2: Requesting backend signature confirmation...");
  // Sign the transaction message hash using our backend validator account
  const signature = await signerAccount.signMessage({
    message: { raw: messageHash },
  });
  console.log(`Generated Cryptographic Signature: ${signature}\n`);

  console.log("Step 3: Compiling relay payload...");
  const relayPayload = {
    user: userAccount.address,
    merchant: merchantAddress,
    amount: itemPrice.toString(),
    executionFee: gasFeeReimbursement.toString(),
    signature: signature,
  };

  console.log(
    "Execution package fully compiled and ready to be routed to GaslessCartPaymaster via a relayer:",
  );
  console.log(JSON.stringify(relayPayload, null, 2));
}

runGaslessCheckout().catch(console.error);
