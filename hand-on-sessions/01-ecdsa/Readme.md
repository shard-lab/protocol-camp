# ECDSA Implementation

## 1. Overview

This hands-on session covers implementing and testing ECDSA (Elliptic Curve Digital Signature Algorithm) functionality using TypeScript. You'll work with pure ECDSA operations without any blockchain-specific implementations.

## 2. Test Description

The project includes TypeScript test files to verify ECDSA functionality. The tests cover:

- Generating ECDSA key pairs
- Signing messages
- Verifying signatures

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

In this exercise, you need to implement the following in TypeScript:

1. In the `ecdsa.ts` file:

   - A function to generate ECDSA key pairs
   - A function to sign messages
   - A function to verify signatures

2. Appropriate comments and documentation for each function

3. In the `ecdsa.test.ts` file, implement test cases for:
   - Key pair generation
   - Signature creation
   - Signature verification
   - Failed verification for invalid signatures

This exercise will help you understand the fundamentals of ECDSA and how to implement a secure digital signature system using TypeScript.
