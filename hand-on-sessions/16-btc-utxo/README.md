# UTXO Implementation

## 1. Overview

In this hands-on exercise, you will implement a simplified UTXO-based transaction system in TypeScript. The goal is to understand how transactions and unspent outputs (UTXOs) are tracked and updated in a basic blockchain-like system. You’ll complete functions that handle collecting inputs, creating outputs, and maintaining a list of unspent outputs (getUnspentUTXOs).

By the end of this exercise, you should have a deeper understanding of the UTXO model, how transactions are formed, and how balances are derived in Bitcoin-like systems.

## 2. Test Description

Your primary tasks revolve around completing the following methods in the `Node` class

1. `getAllUTXOs()`

- Returns all unspent outputs across all addresses.
- This involves collecting outputs from every transaction and removing those that have already been spent as inputs in subsequent transactions.

2. `getUTXOs(address: string)`

- Returns only the unspent outputs owned by the specified address.

3. `gatherInputs()`

- Finds enough unspent outputs owned by sender to cover amount.
- Returns an array of input references ({ txId, vOut }) or throws an error if insufficient funds.

4. `createOutputs()`

- Creates output data for recipient (covering the requested amount) and sends any leftover (change) back to senderAddress.

## 3. UTXO and Transaction Overview

### UTXO

- UTXO stands for Unspent Transaction Output. Once a transaction output is spent in a subsequent transaction, it can no longer be used again.
- In this project, a UTXO contains:
  - txId: The transaction ID where the output was created.
  - vOut: The index of the output in that transaction.
  - address: The recipient’s identifier (akin to a wallet address).
  - amount: The numeric amount of currency allocated to this output.

### Transaction

- A transaction contains:
  - id: A unique identifier for the transaction (in real Bitcoin, this is a hash).
  - inputs: Array of objects referencing previously created outputs ({ txId, vOut }).
  - outputs: Array of new UTXO objects created by this transaction.
- When a transaction is executed (and validated), the referenced UTXOs are considered spent, and the new outputs become unspent until they’re spent by some future transaction.

## 4. How to Run Tests

Follow these steps to run the tests:

1. Open a terminal and navigate to the project directory.
2. Install the necessary dependencies:
   ```
   npm install
   ```
3. Run the tests using the following command:
   ```
   npm run test
   ```

4. You will see two categories of tests:

- Basic functionality tests (in utxo.basic.test.ts), which check your implementations of:
  - getUTXOs
  - gatherInputs
  - createOutputs
- Scenario tests (in utxo.scenario.test.ts), which simulate realistic usage with multiple addresses and transactions.

Your goal is to ensure all tests pass by completing the TODO sections in the `Node` class.
