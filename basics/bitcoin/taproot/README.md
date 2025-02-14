# P2TR Implementation

## 1. Overview

This repository provides a simple, educational example of how Taproot (Pay-to-Taproot, P2TR) can commit multiple spending conditions (scripts) within one output, using a Merkle tree. Only the chosen script branch is revealed at spend time (script path), while other branches remain hidden.

## 2. Learning Objectives

1. Multiple Conditions, One Output
   - Understand that a single UTXO can store several possible script conditions. Only the branch actually used is revealed at spend.

2. Merkle Tree
   - Learn how each script branch is hashed into a "leaf," and how these leaves are combined into a single merkleRoot.
   - See how partial revelation (the chosen leaf + path) proves membership in the tree.

3. Educational Simplification
   - Recognize that real Taproot uses Schnorr signatures, advanced opcodes, etc.
   - Here, we focus purely on the Merkle-based partial reveal concept to keep things clear.

4. Implementing `verifyScriptPath`
   - You will write (or review) a function that checks whether a given leafHash and merklePath recombine to the merkleRoot of a UTXO, and ensures the publicKey matches.
   - This simulates the core logic behind Taproot's script path spending.

## 3. Core Concepts

### 3.1 Script

Each script (in reality, a Tapscript) is simplified here to a `publicKey` (string) and a `condition` (string). A leaf hash is derived by combining these two fields.

### 3.2 UTXO-Like Class

This class (e.g., `UTXO`) holds just:

- `publicKey`: The Taproot output key
- `merkleRoot`: The combined root of all script leaves

Together, these components form the Taproot output's locking script.

### 3.3 UnlockingScript

- Built off-chain when spending.
- Contains a chosen leaf's hash (`leafHash`), a `merklePath` (siblings), and the `publicKey`.
- Passed to `verifyScriptPath()` for final validation.


## 4. Running Tests

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm run test
```
