# Aptos Account Hands-on Session

## 1. Overview

This hands-on session introduces you to creating and managing accounts on the Aptos blockchain. You will learn how to generate new accounts, manage private and public keys, and interact with the Aptos network using the Aptos SDK for TypeScript. The session also covers receiving test coins from the faucet and verifying account balances.

## 2. Test Description

The project includes TypeScript test cases (`AptosAccount.test.ts`) to guide you through creating and managing accounts on Aptos:

1. **Account Creation:** Generate an Aptos account with a private key, public key, and address.
2. **Fixed Account Generation:** Use an existing private key to create an account and receive test coins from the faucet.
3. **Balance Verification:** Check that the generated account has a non-zero balance after receiving coins.

## 3. How to Run Tests

1. Create a `.env` file in the root directory with your Aptos private key:

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
   This will execute the test cases, which check for the following:
   - Successful account creation, including private key, public key, and address verification.
   - Proper initialization of a fixed account using a predefined private key.
   - A non-zero balance for the account after receiving coins from the faucet.

## 4. What to Implement

Your task is to complete the functions in the provided test cases to interact with the Aptos network and manage account keys and balances:

### Function 1: Create New Aptos Account

1. Use the `Account` class from the Aptos SDK to create a new account.
2. Extract the `privateKey`, `publicKey`, and `address` from the generated account and assign them to the respective variables.
3. Verify that each value starts with `0x` and meets the length requirements.

### Function 2: Generate Fixed Account and Check Balance

1. Use the private key from `.env` to create an Aptos account.
2. Call the Aptos faucet to fund the account with test coins (requires connection to `DEVNET`).
3. Retrieve the account balance and verify it is greater than zero.

## 5. Additional Notes

- **Aptos SDK for TypeScript:** This project uses the Aptos SDK to manage accounts and interact with the network. The SDK should be installed as part of the dependencies.
- **Environment Variables:** Ensure that the `.env` file contains the `PRIVATE_KEY_HEX` to create a fixed account. You can use any hex-format private key for testing purposes.
- **Network Configuration:** The Aptos network is configured for `DEVNET` by default to allow free access to the faucet.

This hands-on session will provide you with practical experience in creating and managing accounts on Aptos and interacting with the DEVNET environment, giving you foundational skills for blockchain development on Aptos.
