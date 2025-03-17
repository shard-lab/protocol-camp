# Ordinals Protocol Implementation

This project demonstrates the core mechanics of the Ordinals protocol, which enables tracking and inscribing data on individual satoshis in Bitcoin.

Note: This Learning Module focuses on implementing the fundamental transaction building blocks of the Ordinals protocol.

> **Prerequisites**: To better understand this module, it is recommended to first complete:
>
> - `bitcoin/utxo`: Understanding Bitcoin's UTXO model
> - `bitcoin/taproot`: Understanding Taproot and witness data

> Note: While witness scripts used in this implementation are conceptually related to Taproot,
> this example does not directly utilize Taproot functionality.

## 1. Overview

The Ordinals protocol's elegance comes from three core mechanisms:

1. **Satoshi Tracking**: Every individual satoshi (the smallest unit of Bitcoin) is tracked through transactions, maintaining its position and identity in the UTXO set. This tracking is handled internally by the Ordinals protocol and is provided here for understanding - no implementation is required.

2. **Two-Phase Inscription**: Content is inscribed using a two-phase commit/reveal pattern:

   - First phase commits only a hash of the content
   - Second phase reveals and verifies the original content

3. **UTXO Binding**: Inscriptions are permanently bound to specific satoshis through the UTXO model, allowing them to be transferred, split, or merged while maintaining their association.

To best understand this implementation, start with `ordinals.test.ts` and `ordinals.txbuilder.test.ts`. These files demonstrate how satoshis are tracked through transactions and how inscriptions are created and revealed.

## 2. Learning Objectives

1. Satoshi Tracking System

   - Learn how the Ordinals protocol identifies and tracks individual satoshis
   - Understand how satoshi ranges are managed during UTXO splits and merges
   - See how the protocol maintains satoshi ordering through transactions

2. Inscription Protocol

   - Master the two-phase commit/reveal pattern
   - Learn secure content commitment using hash functions
   - Understand how inscriptions bind to specific satoshis

3. Transaction Building
   - Implement `createCommitTransaction()` for secure content commitments
   - Implement `createRevealTransaction()` for content revelation
   - Learn proper UTXO management for inscriptions

## 3. Core Concepts

### 3.1 Satoshi Tracking

Note: This section explains how the Ordinals protocol tracks satoshis internally. This is provided for understanding the protocol - you won't need to implement this tracking system.

The protocol maintains precise tracking of every satoshi:

- Each satoshi has a unique ordinal number based on the order it was mined
- When UTXOs are spent, satoshi ranges are carefully mapped to new outputs
- The protocol tracks first-in-first-out (FIFO) ordering of satoshis through transactions

### 3.2 Inscription Process

The two-phase inscription process works as follows:

1. Commit Phase:

   - Hash the content to create a commitment
   - Create transaction with commitment in witness data
   - Bind commitment to specific satoshi range

2. Reveal Phase:
   - Reveal original content matching commitment
   - Verify content hash matches commitment
   - Permanently associate content with satoshi

## 4. Implementation Details

### 4.1 Transaction Structure

- **Commit Transaction**: Should contain a hash of the content in witness data with `Opcode.INSCRIBE`
- **Reveal Transaction**: Should contain the actual content in witness data with `Opcode.REVEAL`
- Both transactions must maintain the same UTXO ownership and amount

### 4.2 Witness Data Format

- Witness data should be structured as an array where:
  - First element is the opcode (`Opcode.INSCRIBE` for commit, `Opcode.REVEAL` for reveal)
  - Second element is the commitment hash (for commit) or the original content (for reveal)
  - Example: `[Opcode.INSCRIBE, contentHash]` or `[Opcode.REVEAL, content]`

### 4.3 Content Hashing

- Use `sha256Hex(content)` function to create a hash commitment of the content
- During reveal, verify that `sha256Hex(revealedContent)` matches the original commitment hash

### 4.4 Transaction Creation

The `Transaction.create()` method is used to build both commit and reveal transactions:

- Parameters:
  - `inputs`: Array of transaction inputs (txId and vOut) to spend
  - `outputs`: Array of transaction outputs (address and amount) to create
  - `witness`: Optional witness data array containing opcodes and data
- Example for commit transaction:
  ```typescript
  Transaction.create(
    [{ txId: inputTxId, vOut: inputVOut }],
    [{ address: spender, amount: inputAmount }],
    [Opcode.INSCRIBE, contentHash]
  );
  ```
- Example for reveal transaction:
  ```typescript
  Transaction.create(
    [{ txId: commitTxId, vOut: 0 }],
    [{ address: spender, amount: inputAmount }],
    [Opcode.REVEAL, content]
  );
  ```

## 5. Running Tests

1. Install dependencies:

```bash
npm install
```

2. Run tests:

```bash
npm run test
```

```

```
