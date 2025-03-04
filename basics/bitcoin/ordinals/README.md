# Ordinals Implementation

## 1. Overview

In this repository, we provide a simplified TypeScript example demonstrating how to:

- Track individual satoshis (ordinals) within a single UTXO.
- “Commit” data to specific satoshis as NFTs (hiding the content at first).
- “Reveal” the content later, finalizing the on-chain inscription.

Two core methods, `createTransferTx` and `createRevealTx`, have been left as placeholders. The primary focus is to implement them so that NFT transfer and Taproot-style reveal function correctly within the partial consumption model (selected Satoshi IDs, leftover handling, etc.).

## 2. Learning Objectives
**Ordinals and Satoshi-Level Tracking**

- Understand how each Satoshi can carry a unique identity (ordinal) and potentially represent an NFT.
- Learn how to “commit” hidden NFT content to a Satoshi, and later “reveal” it on-chain.

**Commit & Reveal**

- Recognize that the commit phase only stores a hash (HASH:<someHash>) instead of the full data, preventing front-running or unnecessary early disclosure.
- Later, the reveal transaction provides the actual content, ensuring it matches the committed hash.

**Transfer Mechanism**

- Realize that “NFT Transfer” is essentially partial Satoshi transfer.
- See how one can split off a single Satoshi (the NFT) from a larger UTXO.

**Educational Simplification**

- Real ordinals might rely on advanced Bitcoin features, but here we focus on the minimal code for partial Satoshi selection, hashing, and leftover handling.
- Some real-world details (Taproot signatures, mempool, fee calculations) are omitted for clarity.

**Implementing createTransferTx & createRevealTx**

- You will write (or review) the logic that consumes a UTXO (or partial Satoshi subset) and produces a new UTXO with updated ownership or revealed NFT content.
- Proper leftover handling, error checks (“Signature mismatch!”), and content hashing are crucial parts of the assignment.

## 3. Core Concepts
### 3.1 Satoshi / Ordinal
Each Satoshi is assigned an ID (e.g., 0, 1, 2, ...). A single UTXO can hold many Satoshis. By selecting a specific Satoshi ID (e.g., #10), we can treat it as an NFT.

### 3.2 UTXO Structure
The UTXO class in this assignment holds:

ownerPubKey to identify the current owner.
- `satoshis: Satoshi[]` to manage which Satoshis (ordinals) are in this UTXO.
- `lockingScript`, which might be:
  - A simple "OP_CHECKSIG" for standard transfers.
  - A commit script containing "HASH:xxxx" if an NFT is committed.
  - A reveal script if the full data is disclosed.

### 3.3 Node & Partial Consumption
Node is a simplified class handling:

- `mineBlock()` to create a new UTXO of 50 Satoshis.
- `consumeUTXO()` to remove and partially or wholly consume Satoshis for a transaction.
- `createTransferTx` (to be implemented by you) for general Satoshi (and thus NFT) transfers.
- `createCommitTx` for committing a hidden NFT (HASH:xxxx).
- `createRevealTx` (to be implemented by you) to finalize NFT data and reveal it on-chain.


## 4. Running Tests

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm run test
```
