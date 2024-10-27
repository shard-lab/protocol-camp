# Proof of Work Implementation

## 1. Overview

This hands-on session focuses on implementing a basic Proof of Work (PoW) algorithm using TypeScript. Your task is to complete the `proofOfWork` function in the provided code.

## 2. Test Description

The project includes a pre-implemented TypeScript test file (`pow.test.ts`) that verifies the PoW functionality. The test checks if your `proofOfWork` function correctly finds a nonce that produces a hash with the required number of leading zeros.

## 3. How to Run Tests

To run the tests:

1. Open a terminal and navigate to the project directory.
2. Install dependencies if you haven't already:
   ```
   npm install
   ```
3. Run the tests:
   ```
   npm run test
   ```
4. Your goal is to implement the `proofOfWork` function so that all tests pass.

## 4. What to Implement

Your task is to implement the following function in the `pow.ts` file:

```typescript
function proofOfWork(
  blockData: string,
  difficulty: number
): { nonce: number; hash: string } {
  // Your implementation here
}
```

This function should:

- Take `data` (a string) and `difficulty` (a number) as inputs.
- Find a nonce that, when combined with the `data`, produces a hash with the required number of leading zeros (determined by `difficulty`).
- Return an object containing the found nonce and the resulting hash.

## 5. Performance Consideration

**IMPORTANT:** Finding a nonce for a difficulty of 28 within 30 seconds requires significant computational power. Your challenge is to find an efficient way to perform this computation.

## 6. Additional Notes

- The difficulty determines the number of leading zeros required in the hash.
- Ensure your implementation is efficient, as mining can be computationally intensive.

This exercise will help you understand the core concept of Proof of Work, a fundamental mechanism in many blockchain systems.
