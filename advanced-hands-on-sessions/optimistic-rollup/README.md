# Rollup Hands-on Session

## 1. Overview

This hands-on session focuses on implementing and testing a simplified Rollup mechanism in Solidity. The contract is designed to simulate a limited Layer 2 (L2) environment where only basic transfer operations are supported. It aims to give you hands-on experience with state management and fraud-proof mechanisms in the context of optimistic Rollups.

### Important Note:

The contract does not implement a full-fledged Layer 2 solution. Instead, it provides a basic framework for understanding how Rollups work in a restricted setting. In this scenario, we assume that all proposed states are valid initially, and only challenge them if a fraud proof is submitted. This optimistic Rollup approach allows state changes to be accepted quickly while still enabling invalid states to be rolled back if they are proven to be incorrect.

The key concept here is that the Rollup contract uses **fraud proofs** to detect invalid state changes and revert them. If a user suspects that a proposed state is incorrect, they can submit a fraud proof to challenge the state. If the proof is valid, the contract will roll back the invalid state and maintain the integrity of the Rollup.

## 2. Test Description

The project includes TypeScript test cases (`Rollup.test.ts`) that guide you through the implementation and validation of various Rollup contract functionalities:

1. **State Initialization:** Verify that the initial state is correctly set during contract deployment.
2. **State Proposal:** Propose new Rollup states and validate the emitted events.
3. **State Finalization:** Finalize proposed states after a certain time period.
4. **Fraud Proof Handling:** Submit fraud proofs to invalidate incorrect proposed states and ensure state consistency.
5. **Edge Case Handling:** Handle scenarios like invalid state proofs, incorrect nonce values, or insufficient balance during transaction replay.

## 3. How to Run Tests

1. Open a terminal and navigate to the project directory.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the tests:
   ```bash
   npm run test
   ```
   This will execute the test cases, which will check for the following:
   - Proper state initialization during contract deployment.
   - Correct behavior when proposing and finalizing Rollup states.
   - Accurate validation of fraud proofs to detect invalid state changes.
   - Handling of edge cases such as invalid Merkle proofs or incorrect transaction details.

## 4. What to Implement

Your task is to complete the functions in the Rollup contract and ensure that the test cases pass. Below is a description of each function to implement:

### Function 1: `proposeState`

1. Create a new `RollupState` with the provided block Merkle root, state Merkle root, and the current timestamp.
2. Add the new state to the `proposed` array.
3. Emit the `RollupProposed` event with the index, roots, and timestamp.

### Function 2: `finalizeState`

1. Validate that the provided index is within the bounds of the `proposed` array.
2. Check that the finalization period has passed since the state was proposed.
3. Add the state to the `finalized` array and remove it from the `proposed` array.
4. Emit the `RollupFinalized` event with the finalized index and roots.

### Function 3: `submitFraudProof`

1. Verify the initial account state proof using Merkle proofs.
2. Calculate the Merkle root of the transactions and compare it with the proposed block Merkle root.
3. Verify the after-state proof using Merkle proofs.
4. Replay the transactions to update the current state.
5. Ensure the computed final state matches the provided after state; if it does not, invalidate the proposed state.

### Function 4: `calculateTransactionMerkleRoot`

1. If the transactions array is empty, return `bytes32(0)`.
2. Otherwise, hash each transaction and compute the Merkle root.
3. Use the provided Merkle proof utilities to calculate the root.

### Function 5: `invalidateProposedState`

1. Retrieve the Rollup state to be invalidated from the `proposed` array.
2. Remove the state from the `proposed` array and shift the remaining elements.
3. Emit the `RollupInvalidated` event with the index and roots.

### Function 6: Utility Functions (`getProposedLength`, `getFinalizedLength`)

1. Return the length of the `proposed` and `finalized` arrays, respectively.

## 5. Additional Notes

- **Rollup Mechanism:** This project simulates an optimistic Rollup, where proposed states are assumed to be valid unless proven otherwise. Fraud proofs allow users to challenge invalid states and trigger a rollback.
- **Limitations:** The Rollup implementation here only supports basic transfer operations and does not represent a full L2 solution. It is designed for educational purposes, allowing you to explore the fundamentals of Rollup mechanics in a simplified environment.
- **Merkle Proof Handling:** Make sure to use the `MerkleProof` utilities correctly for calculating and verifying Merkle roots.
- **Testing Edge Cases:** The test cases include various edge cases, such as invalid proof submissions and transaction replays with incorrect nonces or balances.

This hands-on session will give you practical experience with optimistic Rollup mechanisms and state management in Solidity, helping you understand the basics of Layer 2 scaling solutions and the role of fraud proofs in ensuring Rollup security.
