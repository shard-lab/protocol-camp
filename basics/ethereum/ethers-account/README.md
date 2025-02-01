# Ethereum Account Hands-on Session

## 1. Overview

This hands-on session focuses on creating and interacting with Ethereum accounts using the `ethers.js` library. You will implement code to generate a new externally owned account (EOA), retrieve the associated public key and address, and verify the account details. Additionally, you will check the balance of an existing EOA to confirm the receipt of Ether from a faucet.

## 2. Test Description

The project includes TypeScript test cases (`ethereum.test.ts`) to guide you through the implementation:

1. **Create a New EOA:** Generate a private key, compressed public key, and address using `ethers.js`.
2. **Verify Account Balance:** Use a fixed private key to set up an EOA, receive faucet Ether on the Sepolia test network, and verify that the balance is non-zero.

## 3. How to Run Tests

1. Open a terminal and navigate to the project directory.

2. Run the tests:
   ```bash
   npm run test
   ```
   This will execute the test cases, which will check for the following:
   - The generated private key, public key, and address follow the correct format.
   - The address derived from the public key matches the generated address.
   - The account balance is verified to be non-zero after receiving Sepolia Ether.

## 4. What to Implement

Your task is to complete the functions in the provided test cases:

### Function 1: Create a New EOA

1. Generate a private key.
2. Derive the compressed public key and address using `ethers.js`.
3. Implement the tests to ensure the generated values meet the requirements.

### Function 2: Verify Account Balance

1. Use a fixed private key from the `.env` file to create a `Wallet` instance.
   Create a `.env` file in the project root with the following format:

   ```
   PRIVATE_KEY="<Your Private Key in Hex Format>"
   ```

   Replace `<Your Private Key in Hex Format>` with your actual private key in hexadecimal format.

2. Connect to the Ethereum Sepolia test network using Infura.
3. Retrieve and verify the balance for the wallet address.

## 5. Additional Notes

- **Infura Setup:** Make sure your Infura project allows access to the Sepolia network.
- **Handling Environment Variables:** Do not commit your `.env` file to version control. It contains sensitive information.

This hands-on session will help you understand how to interact with Ethereum accounts programmatically, a fundamental skill in blockchain development.
