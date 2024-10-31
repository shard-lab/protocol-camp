# Aptos Transaction Hands-on Session

## 1. Overview

This hands-on session is designed to give you experience with transactions on the Aptos blockchain. You will learn how to manage unit conversions for APT tokens, transfer APT between accounts, deploy a custom module (`SimpleStorage`), and interact with the deployed contract by setting and retrieving a value.

## 2. Test Description

The project includes TypeScript test cases (`AptosTransaction.test.ts`) that guide you through various Aptos transaction tasks:

1. **Unit Conversion:** Handle conversions between APT and Octas, the smallest unit of APT (1 APT = 10^8 Octas).
2. **APT Transfer:** Send APT from a sender account to a receiver account and verify the transfer.
3. **Module Deployment:** Deploy the `SimpleStorage` Move module to the Aptos network.
4. **Interact with SimpleStorage Module:** Set a value in the `SimpleStorage` contract and retrieve it to verify.

## 3. How to Run Tests

1. Set up a `.env` file in the root directory with your Aptos private key:

   ```plaintext
   PRIVATE_KEY_HEX=your_private_key_in_hex_format
   ```

2. Open a terminal and navigate to the project directory.

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the tests:
   ```bash
   npm run test
   ```
   This will execute the test cases, which check for:
   - Accurate conversions between APT and Octas.
   - Successful APT transfer from sender to receiver.
   - Deployment and verification of the `SimpleStorage` module.
   - Setting and retrieving a value in the `SimpleStorage` contract.

## 4. What to Implement

Your task is to complete the functions in the provided test cases, enabling interaction with the Aptos network and handling transactions:

### Function 1: APT to Octas Unit Conversion

1. Convert 1 APT to Octas, confirming the result equals 10^8.
2. Convert 10^8 Octas back to APT, verifying it equals 1.
3. Use the test case assertions to ensure conversions are correct.

### Function 2: Transfer APT Tokens

1. Generate a new receiver account.
2. Retrieve the sender’s initial balance and transfer a specified amount to the receiver.
3. Confirm the receiver’s balance equals the transferred amount and that the sender’s balance reflects the transfer and gas cost.

### Function 3: Deploy SimpleStorage Module

1. Build a Move module file named `SimpleStorage` located in the `08-aptos-transaction/module/storage.move`.
2. Publish the module package on the Aptos network using the sender’s account.
3. Verify that the module is deployed successfully by checking its ABI address.

### Function 4: Interact with SimpleStorage Contract

1. Use the `set_value` function in the `SimpleStorage` module to store a specific integer.
2. Retrieve the stored value using the `get_value` function.
3. Confirm that the retrieved value matches the stored value.

## 5. Additional Notes

- **Aptos SDK for TypeScript:** This project uses the Aptos SDK for managing accounts, transactions, and module deployments. Ensure the SDK is correctly installed as part of the dependencies.
- **Environment Variables:** Set `PRIVATE_KEY_HEX` in your `.env` file to define the sender’s private key. This is required for account initialization and signing transactions.
- **Unit Conversion Reminder:** Remember that Aptos uses Octas as the smallest unit for APT, so 1 APT = 10^8 Octas.
- **Gas Fees:** Be mindful of gas costs when verifying sender and receiver balances after transfers.

This session will equip you with practical experience in executing Aptos transactions, managing APT tokens, and deploying and interacting with on-chain modules, providing foundational skills for blockchain development on Aptos.
