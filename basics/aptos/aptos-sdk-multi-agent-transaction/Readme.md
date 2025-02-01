# Aptos Multi-Agent Transactions Hands-on Session

## 1. Overview

This hands-on session focuses on implementing a **multi-agent transaction** on the Aptos blockchain using the Aptos SDK for TypeScript. Multi-agent transactions involve multiple signers authorizing a single transaction, enabling complex interactions that require consent from multiple parties. In this session, you'll learn how to construct, sign, and submit a transaction that requires signatures from both a primary signer and one or more secondary signers (co-signers).

## 2. Test Description

The project includes a test case that verifies the implementation of a multi-agent transaction. The test involves the following components:

- **Module**: A Move module (`MultSignerModule`) that defines a counter resource associated with a primary signer and a co-signer.
- **Accounts**:
  - **Signer**: The primary account that owns the counter resource.
  - **Co-signer**: The secondary account that must also authorize certain actions on the counter.
- **Initial Setup**:
  - The counter is initialized with a value and associated with the signer's address.

### Test Case Objectives:

1. **Initialize the Counter**:

   - Use the `init_counter` function to create a new counter resource associated with the signer and link it to the co-signer's address.

2. **Implement Multi-Agent Transaction**:

   - Build a transaction to increment the counter value using the `up` function in the module.
   - The transaction must be signed by both the signer and the co-signer.

3. **Submit and Verify Transaction**:
   - Submit the transaction to the Aptos network.
   - Wait for the transaction to be confirmed.
   - Verify that the counter value has been incremented by one.

## 3. How to Run Tests

1. **Install Dependencies**:

   - Ensure you have Node.js installed.
   - Run the following command to install project dependencies:
     ```bash
     npm install
     ```

2. **Run the Test**:
   - Execute the test case with the following command:
     ```bash
     npm run test
     ```
   - The test will run and display the results in the console.

## 4. What to Implement

Your task is to complete the implementation of the multi-agent transaction so that all assertions in the test pass successfully. Focus on the following key steps:

### Key Implementation Steps:

1. **Build the Multi-Agent Transaction**:

   - **Purpose**: Construct a transaction that requires signatures from both the signer and the co-signer.
   - **Action**:
     - Use the Aptos SDK to build a multi-agent transaction.
     - Specify the primary signer and the secondary signer(s).
     - Define the transaction payload to call the `up` function in the module.

2. **Sign the Transaction**:

   - **Purpose**: Authorize the transaction with all required signatures.
   - **Action**:
     - Sign the transaction using the primary signer's account.
     - Sign the transaction using the co-signer's account.
     - Ensure both signatures are included in the transaction submission.

3. **Submit the Transaction**:

   - **Purpose**: Send the fully signed transaction to the Aptos network for execution.
   - **Action**:
     - Use the Aptos SDK to submit the transaction, including all necessary authenticators.

4. **Wait for Transaction Confirmation**:

   - **Purpose**: Ensure the transaction has been processed and included in a block.
   - **Action**:
     - Wait for the transaction to be confirmed by checking its status on the network.

## 5. Additional Notes

- **Understanding Multi-Agent Transactions**:

  - Multi-agent transactions enable actions that require approval from multiple parties.
  - All involved parties must sign the transaction for it to be valid.
  - Use a `aptos.transaction.build.multiAgent` method

- **Module Functions**:

  - **`init_counter`**:
    - Initializes the counter resource for the signer and sets the co-signer's address.
  - **`up`**:
    - Increments the counter value.
    - Requires both the signer and co-signer to authorize the action.
  - **`get`**:
    - Retrieves the current value of the counter.

- **Key Concepts**:

  - **Transaction Building**: Constructing a transaction that includes multiple signers.
  - **Signing**: Each signer must sign the transaction independently.
  - **Submission and Confirmation**: The transaction must include all signatures when submitted.

- **Testing Tips**:
  - Ensure that both the signer and co-signer accounts are properly initialized and funded.
  - Pay attention to the transaction payload and ensure it matches the module's function definitions.
  - Use the correct module address when specifying function calls in the transaction.

By completing this session, you'll gain practical experience in implementing multi-agent transactions on the Aptos blockchain, enhancing your understanding of transaction coordination among multiple parties and advanced transaction construction.
