Here’s a README for the Ethereum Transaction Hands-on Session:

# Ethereum Transaction Hands-on Session

## 1. Overview

This hands-on session focuses on handling Ethereum transactions using `ethers.js`. You will learn how to perform unit conversions between different Ethereum units, send Ether between accounts, and deploy and interact with a smart contract (`SimpleStorage`).

## 2. Test Description

The project includes TypeScript test cases (`transaction.test.ts`) to guide you through the implementation:

1. **Unit Conversion:** Handle conversions between `wei`, `gwei`, and `ether`.
2. **Ether Transfer:** Send Ether from a sender to a receiver and verify the transfer.
3. **Deploy Smart Contract:** Deploy the `SimpleStorage` contract to the network.
4. **Interact with Smart Contract:** Set and retrieve values using the deployed `SimpleStorage` contract.

## 3. How to Run Tests

1. Open a terminal and navigate to the project directory.

2. Run the tests:
   ```bash
   npm run test
   ```
   This will execute the test cases, which will check for the following:
   - Proper unit conversions between `wei`, `gwei`, and `ether`.
   - Ether is successfully transferred from one account to another.
   - The `SimpleStorage` contract is deployed successfully, and its address is verified.
   - Values are correctly set and retrieved from the `SimpleStorage` contract.

## 4. What to Implement

Your task is to complete the functions in the provided test cases:

### Function 1: Unit Conversion

1. Convert 1 `ether` to `wei` and verify that it equals `10^18`.
2. Convert `10^18` `wei` to `ether` and verify that it equals `1`.
3. Convert 1 `gwei` to `wei` and verify that it equals `10^9`.
4. Convert `10^9` `wei` to `gwei` and verify that it equals `1`.

### Function 2: Ether Transfer

1. Retrieve the sender and receiver accounts.
2. Transfer 1 `ether` from the sender to the receiver.
3. Verify that the receiver's balance increased by the transferred amount.

### Function 3: Deploy SimpleStorage Contract

1. Deploy the `SimpleStorage` smart contract using the contract factory.
2. Verify that the contract has a valid address.

### Function 4: Interact with SimpleStorage Contract

1. Deploy the `SimpleStorage` smart contract.
2. Call the function to set a value in the contract.
3. Retrieve the stored value and verify that it matches the expected value.

## 5. Additional Notes

- **Smart Contract Location:** The `SimpleStorage` contract is located in the `contracts` folder (`05-transaction/contracts/SimpleStorage.sol`).
- **Gas Consideration:** When deploying or interacting with contracts, make sure to handle gas estimation or set gas limits appropriately.
- **Handling Environment Variables:** Use a `.env` file for storing sensitive information such as private keys, if needed.

This hands-on session will give you practical experience with Ethereum transactions and smart contract interaction using `ethers.js`.
