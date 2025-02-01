# UTXO Implementation

## 1. Overview

In this hands-on exercise, you will implement a simplified UTXO-based transaction system in TypeScript. The goal is to understand how transactions and unspent outputs (UTXOs) are tracked and updated in a basic blockchain-like system. You'll implement core functionality to handle UTXOs and transactions in a Bitcoin-like system.

By the end of this exercise, you should have a deeper understanding of the UTXO model, how transactions are formed, and how balances are derived in Bitcoin-like systems.

## 2. Test Description

Your primary task is to implement the following methods in the `Node` class:

1. `getAllUTXOs()`
   - Returns all unspent transaction outputs (UTXOs) in the system
   - Must correctly identify and exclude spent outputs

2. `getUTXOs(address: string)`
   - Returns unspent outputs owned by the specified address
   - Filters results from getAllUTXOs() for the given address

3. `createTransaction(sender: string, recipient: string, amount: number | Decimal)`
   - Creates a new transaction with appropriate inputs and outputs
   - Must gather sufficient inputs to cover the transaction amount
   - Must create appropriate outputs including change if necessary

## 3. Core Concepts

### UTXO (Unspent Transaction Output)
A UTXO represents unspent BTC in the system and contains:
- `txId`: Transaction ID where the output was created
- `vOut`: Index number of the input in the previous transaction
- `address`: Owner's address
- `amount`: Amount of BTC

### Transaction
A transaction consists of:
- `id`: Unique identifier
- `inputs`: References to UTXOs being spent
- `outputs`: New UTXOs being created

## 4. Test Structure

The test suite is divided into two main parts:

### Basic Functionality Tests (utxo.test.ts)
Tests core UTXO operations:
- UTXO tracking and retrieval
- Transaction input gathering
- Output creation
- Basic error cases

### Scenario Tests (utxo.scenario.test.ts)
Tests real-world usage scenarios:
- Multiple transfers between addresses
- Change output handling
- Spent output tracking
- Insufficient funds handling

## 5. Running Tests

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm run test
```
