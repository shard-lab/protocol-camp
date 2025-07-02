# EIP-7702 EOA Delegation Implementation

**The primary goal of this assignment is to make all tests pass.**

This Learning Module continues to explain the EIP-7702 delegation mechanism, which enables Externally Owned Accounts (EOAs) to delegate their execution to smart contracts while still retaining their original account properties. The BatchExecutor contract is provided as a practical example to illustrate how this delegation works in real scenarios.

> **Prerequisites**: To get the most out of this module, you should have:
>
> - A basic understanding of Ethereum accounts and transactions
> - Familiarity with Solidity smart contract development
> - Knowledge of the EIP-7702 delegation mechanism
> - An understanding of the differences between EOAs and contract accounts

<br>

## 1. Overview

EIP-7702 introduces a groundbreaking feature: **EOAs can delegate their execution to smart contracts**. In practice, this means:

- EOAs are able to execute smart contract logic while still being EOAs
- There is no need to deploy proxy contracts or change the account type
- Delegation can be updated or revoked at any time by the EOA owner
- EOAs retain their native properties (such as balance, nonce, and private key control)

The BatchExecutor contract in this module is a **simple example implementation** that demonstrates how EIP-7702 delegation works in practice. The main points to focus on are:

- **How delegation changes EOA behavior**
- **The format and verification of delegation bytecode**
- **How state is preserved during delegation updates**
- **The practical implications of delegating EOA execution to a contract**

## 2. Learning Objectives

- **Primary**: Gain a clear understanding of the EIP-7702 delegation mechanism and its implications
- Learn how EOAs can execute smart contract code without becoming contract accounts
- Explore the delegation bytecode format and how it is verified
- Understand how state is preserved and how upgrades can be performed for delegated EOAs
- **Secondary**: See a practical implementation of delegation using the BatchExecutor example
- Understand the differences between traditional proxy patterns and EIP-7702 delegation

## 3. EIP-7702 Delegation Core Concepts

### 3.1 What is EIP-7702 Delegation?

EIP-7702 allows an EOA to **act as a smart contract** by delegating its execution to an implementation contract:

**Traditional Model:**

- EOA: Can only send transactions, cannot execute custom logic
- Contract: Can execute custom logic, but is a different account type

**EIP-7702 Model:**

- EOA: Can delegate execution to contract logic while remaining an EOA
- Maintains EOA properties: balance, nonce, and private key control
- Gains contract capabilities: custom execution logic, complex operations

### 3.2 Delegation Mechanism

#### 3.2.1 Delegation Process

1. **Authorization Creation**

   - The EOA owner signs a delegation authorization
   - The authorization specifies the target implementation contract address
   - Additional parameters (such as nonce, chain ID, etc.) can be included

2. **Delegation Activation**

   - The authorization is submitted in a transaction
   - The EOA's code field is set to the delegation bytecode
   - The EOA now executes the logic of the delegated contract

3. **Execution Flow**
   ```
   Call to EOA → Delegation Check → Forward to Implementation → Execute with EOA Context
   ```

### 3.2.2 Delegation Bytecode

- Delegation is activated by setting the EOA's code field to a special delegation bytecode.
- This bytecode does not contain the actual logic, but instead forwards all calls to the designated implementation contract using `DELEGATECALL`.
- The delegation bytecode:
  - Detects calls to the EOA
  - Forwards execution to the implementation contract
  - Preserves the EOA's context (address, balance, etc.)

### 3.2.3 Updating and Revoking Delegation

- The EOA owner can submit a new delegation authorization at any time to update the implementation contract or revoke delegation.
- Revoking delegation restores the EOA to its original behavior.

## 4. BatchExecutor Example

This section explains the `BatchExecutor` contract in the context of EIP-7702 delegation, focusing on both implementation and testing aspects relevant to the delegation mechanism.

### 4.1 What is BatchExecutor?

- `BatchExecutor` is a contract that allows an EOA, via EIP-7702 delegation, to execute multiple contract calls in a single transaction.
- When an EOA delegates to this contract, it can perform complex, multi-step operations atomically, while still retaining its EOA properties (such as nonce and balance).

### 4.2 Key Features Demonstrated in This Module

- **EIP-7702 Delegation Verification**  
  The module demonstrates how an EOA can delegate its execution to a smart contract, and includes tests to verify that the delegation has been correctly applied.

- **Batch Execution of Transactions**  
  The `BatchExecutor` contract allows an EOA (with delegated code) to execute one or more ETH transfers or contract calls in a single transaction. This is tested for both single and multiple operations.

- **Access Control: Owner and Guardians**  
  Only the EOA owner and explicitly authorized guardian addresses can execute batch operations. Unauthorized users are prevented from executing batches. This access control is strictly enforced and tested.

- **ETH Reception**  
  The delegated EOA can still receive ETH transfers directly, preserving its native EOA properties. This is explicitly tested to ensure compatibility.

- **Upgradability and Storage Compatibility**  
  The module demonstrates how an EOA can upgrade its delegated logic (e.g., from `BatchExecutor` to `BatchExecutorV2`) without losing state or breaking access control. Storage layout compatibility is tested to ensure that guardians and other state variables are preserved across upgrades.

- **Execution Counters and Batch Atomicity (V2)**  
  In the upgraded version, the module tracks the number of batch executions and ensures that multiple operations in a batch are executed atomically.

### 4.3 Testing and Key Behaviors

- **Delegation Verification:** Ensure that after delegation, the EOA can successfully call `executeBatch` and that each sub-call is executed with the EOA as `msg.sender`, as described in 4.2.
- **State Updates:** Check that the EOA’s balance and nonce are updated correctly after batch execution, reflecting all transfers and contract calls.
- **State Ownership:** Remember that all state changes and side effects from batch execution are applied to the EOA’s storage and balance, not to the BatchExecutor contract itself.

## 5. Running Tests

1. Install dependencies:

```bash
forge install
```

2. Run tests:

```bash
forge test
```
