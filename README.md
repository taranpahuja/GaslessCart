# GaslessCart

**Frictionless Web3 E-commerce via Account Abstraction (ERC-4337) principles.**

GaslessCart is a complete end-to-end decentralized application (dApp) built on the Base network. It enables e-commerce storefronts to accept USDC payments without forcing the consumer to hold native gas tokens (ETH) or understand blockchain mechanics. 

By utilizing off-chain cryptographic signatures and an on-chain Paymaster architecture, the protocol abstracts away network fees and provides a seamless, Web2-like checkout experience.

---

## System Architecture

The project consists of three core layers working in tandem:

1. **Smart Contracts (Solidity/Foundry):**
   - `MockUSDC.sol`: An ERC-20 stablecoin representation.
   - `GaslessCartPaymaster.sol`: The core settlement engine. It verifies EIP-712 cryptographic signatures, transfers the product cost to the merchant, and reimburses the relayer for the gas spent.
2. **Off-Chain Relayer (Node.js/Viem):**
   - A secure backend environment (`interact.js`) that validates user intents and countersigns payload hashes to prevent unauthorized smart contract execution.
3. **Frontend Storefront (Next.js/React):**
   - A consumer-facing UI simulating an e-commerce checkout. It handles state management, local signature generation, and live network event logging.

---

## Technology Stack

* **Network:** Base (Optimism L2 Stack)
* **Smart Contracts:** Solidity `^0.8.20`, OpenZeppelin Contracts
* **Development Framework:** Foundry (Rust-based EVM toolkit)
* **Frontend:** Next.js (App Router), TailwindCSS
* **Web3 Integration:** Viem, Viem/accounts
* **Security:** `dotenv` for localized key management

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ LTS)
- [Foundry](https://getfoundry.sh/) (Forge, Cast, Anvil)
- Git

### 1. Installation

```bash
git clone [https://github.com/YOUR_USERNAME/GaslessCart.git](https://github.com/YOUR_USERNAME/GaslessCart.git)
cd GaslessCart
forge install
npm install
cd frontend
npm install
cd ..
```

### 2. Environment Setup

```bash
touch .env
```

```env
USER_PRIVATE_KEY=0xYourUserPrivateKeyHere
SIGNER_PRIVATE_KEY=0xYourBackendSignerPrivateKeyHere
```

### 3. Running the Test Suite

```bash
forge test -vvv
```

### 4. Running the Relayer Script

```bash
node interact.js
```

### 5. Launching the Frontend Storefront

```bash
cd frontend
npm run dev
```

---

## Security Considerations

* **Replay Attacks:** The `GaslessCartPaymaster` utilizes a strictly incrementing `nonce` mapping per user address to completely neutralize replay attacks.
* **Backend Authorization:** Transactions are gated by a `require(signer == verifyingSigner)` constraint, ensuring only payloads verified by the proprietary backend can be settled on-chain.

---

## Roadmap & Future Improvements

- [ ] Upgrade standard `transferFrom` logic to **ERC-20 Permit (EIP-2612)** for true zero-gas initial approvals.
- [ ] Refactor the custom Paymaster into a fully compliant **ERC-4337 EntryPoint** module.
- [ ] Integrate a live dynamic gas-pricing API into the relayer script.
- [ ] Add WalletConnect or Privy to the Next.js frontend for real wallet interactions.
