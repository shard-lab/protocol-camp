# UTXO Implementation

## 1. Overview

This hands-on session focuses on implementing and testing a simplified UTXO (Unspent Transaction Output) model using TypeScript. You will create a minimal blockchain-like transaction flow with the following key components:

UTXO: Represents a piece of currency owned by a user.

Wallet: Stores a collection of UTXOs for a specific user.

Transaction: Defines how UTXOs move from one user to another.

## 2. Test Description

The project includes a set of test cases (test/utxo.test.ts) that validate:

1. Collecting Inputs
- Ensures that a transaction gathers enough UTXOs from the sender to cover the intended transfer amount.

2. Transaction Validation
- Checks if the total input amount is greater than or equal to the send amount.
- Throws an error if there are insufficient funds.

3. Creating Outputs
- Splits the total input amount into the recipient’s portion and the sender’s leftover (change).
- Ensures correct distribution of any remaining balance back to the sender.

4. Applying Transactions
- Updates the sender's and recipient's Wallet objects by removing and adding appropriate UTXOs.
- Verifies final balances for both parties.

5. Full Execution
- Runs all steps (collectInputs, validateTransaction, createOutputs, applyTransaction) via execute() and checks the end-state balances.
- There are Success Cases (transactions should finalize correctly) and Fail Cases (transactions should fail due to insufficient funds).


## 3. How to Run Tests

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
4. Check the test results. All tests should pass.

## 4. What to Implement

You will focus on completing two crucial methods in the Transaction class (transaction.ts):

1. `collectInputs()`

- Collect enough UTXOs from the sender’s wallet to cover the transaction amount.
- Store these UTXOs in the transaction’s inputs array.
- Ensure the sum of these inputs meets or exceeds this.amount.

2. `createOutputs()`

- Create a UTXO for the recipient with the amount being sent.
- If there is any leftover balance (total inputs - send amount), create a UTXO for the sender.
- Push these new UTXOs to the transaction’s outputs array.

