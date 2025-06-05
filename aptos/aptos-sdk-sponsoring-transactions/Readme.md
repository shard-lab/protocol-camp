# Aptos Sponsoring Transactions Hands-on Session

## 1. Overview

This hands-on session focuses on implementing a **sponsoring transaction** on the Aptos blockchain using the Aptos SDK for TypeScript. Sponsoring transactions allow a third party (the sponsor) to pay the gas fees on behalf of another user (the sender), enabling users with insufficient funds to perform transactions. In this session, you'll learn how to construct, sign, and submit a transaction where the gas fees are covered by a sponsor account.

## 2. Test Description

The project includes a test case that verifies the implementation of a sponsoring transaction. The test involves the following steps:

- **Accounts Setup**:
  - **Sender**: An account that initiates the transfer but relies on the sponsor to pay for gas fees.
  - **Sponsor**: An account that pays the gas fees for the sender's transaction.
  - **Destination**: The recipient account that receives the tokens.

### Test Case Objectives:

1. **Build a Transaction**:

   - Create a transaction where the sender transfers APT tokens to the destination.
   - Enable fee sponsorship in the transaction.

2. **Sign the Transaction**:

   - Sign the transaction as the sender to authorize the transfer.
   - Sign the transaction as the sponsor to authorize the payment of gas fees.

3. **Submit and Confirm the Transaction**:

   - Submit the fully signed transaction to the Aptos network.
   - Wait for the transaction to be confirmed.

## 3. How to Run Tests

1. **Install Dependencies**:

   - Make sure you have Node.js installed.
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

Your task is to complete the implementation of the sponsoring transaction so that all assertions in the test pass successfully. Focus on the following key steps:

### Key Implementation Steps:

1. **Build the Transaction**:

   - **Purpose**: Construct a transaction that enables fee sponsorship.
   - **Action**:
     - Use the Aptos SDK to build a transaction with fee sponsorship enabled.
     - Specify the sender's account address and the transfer details (function and arguments).
     - Set the `withFeePayer` option to indicate that a sponsor will pay the gas fees.

2. **Sign the Transaction as the Sender**:

   - **Purpose**: Authorize the token(APT) transfer from the sender to the destination.
   - **Action**:
     - Sign the transaction using the sender's account.
     - This signature proves that the sender approves the transfer.

3. **Sign the Transaction as the Sponsor**:

   - **Purpose**: Authorize the payment of gas fees by the sponsor.
   - **Action**:
     - Sign the transaction as the fee payer using the sponsor's account.
     - This signature confirms that the sponsor agrees to cover the gas fees.

4. **Submit the Transaction**:

   - **Purpose**: Send the fully signed transaction to the Aptos network for execution.
   - **Action**:
     - Use the Aptos SDK to submit the transaction, including both the sender's and sponsor's signatures.

5. **Wait for Transaction Confirmation**:

   - **Purpose**: Ensure the transaction has been processed and included in a block.
   - **Action**:
     - Wait for the transaction to be confirmed by checking its status on the network.

## 5. Additional Notes

- **Understanding Sponsoring Transactions**:

  - Sponsoring transactions enable users without sufficient gas funds to perform transactions.
  - The sponsor covers the gas fees, while the sender authorizes the transaction's actions.

- **Key Concepts**:

  - **Transaction Building**: Constructing a transaction with the appropriate parameters and options.
  - **Signing**: Both the sender and sponsor need to sign the transaction to authorize their respective parts.
  - **Submission and Confirmation**: Sending the transaction to the network and awaiting its confirmation.

- **Testing Tips**:
  - Ensure all accounts (sender, sponsor, destination) are properly funded in the test setup.
  - Pay attention to the gas fees when verifying the sponsor's balance.
  - Use the Aptos Devnet configuration as specified in the test.
