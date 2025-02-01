# Ethereum State Hands-on Session

## 1. Overview

This hands-on session focuses on managing state transitions in an Ethereum-like environment using a `State` class to handle account balances. You will implement state changes by applying, committing, and reverting transactions to simulate basic blockchain operations.

## 2. Test Description

The project includes TypeScript test cases (`state.test.ts`) to guide you through the implementation:

1. **Apply Transactions:** Simulate the application of a transaction, affecting the working state without modifying the committed state.
2. **Commit Transactions:** Commit the working state changes to the committed state.
3. **Revert Transactions:** Revert the working state to match the committed state, discarding any uncommitted changes.
4. **Scenario Tests:** Execute a sequence of state changes to verify the correct behavior of the `State` class.

## 3. How to Run Tests

1. Open a terminal and navigate to the project directory.

2. Run the tests:
   ```bash
   npm run test
   ```
   This will execute the test cases, which will check for the following:
   - Transactions are applied to the working state correctly.
   - Committing changes updates the committed state.
   - Reverting discards uncommitted changes and restores the committed state.
   - Complex sequences of operations (apply, commit, revert) behave as expected.

## 4. What to Implement

Your task is to complete the functions in the provided test cases and understand the workflow for state transitions:

### Function 1: Apply Transactions

1. Modify the working state based on a transaction's details (`from`, `to`, `value`).
2. Ensure that the committed state remains unaffected until the changes are committed.
3. Throw an error if the `from` account does not have a sufficient balance to complete the transaction.

### Function 2: Commit Transactions

1. Commit the current working state to the committed state.
2. Clear the working state cache after committing the changes.

### Function 3: Revert Transactions

1. Clear the working state cache, effectively discarding any uncommitted changes.

### Scenario Tests

1. Handle various sequences of `apply`, `commit`, and `revert` operations.
2. Ensure that balances are updated and reverted correctly based on the operations performed.

## 5. Additional Notes

- **Error Handling:** Ensure that appropriate error messages are thrown when a transaction is invalid (e.g., insufficient balance).
- **Balance Calculation:** Account balances are retrieved from the working state if available, falling back to the committed state when necessary.

## 6. Code Structure

### `State` Class

The `State` class is responsible for managing account balances and providing methods to apply, commit, and revert state changes:

- **`apply(transaction: Transaction): void`**: Applies a transaction to the working state.
- **`commit(): void`**: Commits the working state to the committed state.
- **`revert(): void`**: Reverts the working state back to the committed state.
- **`getBalance(address: string): number`**: Retrieves the balance of an account.
- **`getCommittedState(): Map<string, number>`**: Returns the current committed state.

### `Transaction` Interface

The `Transaction` interface represents a state transition with the following properties:

- **`from: string`**: The sender's account.
- **`to: string`**: The receiver's account.
- **`value: number`**: The amount to be transferred.

This hands-on session will help you understand the fundamentals of state management in a blockchain-like system, including transaction application, state commitment, and error handling.
