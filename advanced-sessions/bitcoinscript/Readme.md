# Bitcoin Script Interpreter Implementation

## 1. Overview

This hands-on session focuses on implementing key Bitcoin Script operations in TypeScript. Your task is to complete the `opCodeFunctions` object in the provided `bitcoinscript-interpreter.ts` file.

## 2. What to Implement

Your task is to implement the following opcode functions in the `opCodeFunctions` object:

```typescript
export const opCodeFunctions: { [key in OpCode]: OpCodeFunction } = {
  [OpCode.OP_DUP]: (stack) => {
    // Implement OP_DUP
  },
  [OpCode.OP_HASH160]: (stack) => {
    // Implement OP_HASH160
  },
  [OpCode.OP_EQUALVERIFY]: (stack) => {
    // Implement OP_EQUALVERIFY
  },
  [OpCode.OP_CHECKSIG]: (stack) => {
    // Implement OP_CHECKSIG
  },
  [OpCode.OP_EQUAL]: (stack) => {
    // Implement OP_EQUAL
  },
};
```

Each function should manipulate the `stack` according to the Bitcoin Script rules for that opcode.

## 3. Bitcoin Script Operations

Here's a brief description of each opcode you need to implement:

1. `OP_DUP`: Duplicates the top stack item.
2. `OP_HASH160`: Hashes the top stack item first with SHA-256 and then with RIPEMD-160.
3. `OP_EQUALVERIFY`: Same as OP_EQUAL, but runs OP_VERIFY afterward.
4. `OP_CHECKSIG`: Checks the signature against the public key.
5. `OP_EQUAL`: Pops two items and pushes true if they are equal, false otherwise.

## 4. How to Run Tests

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
4. Your goal is to implement the `opCodeFunctions` so that all tests pass.

## 5. Optional Advanced Task: Implement P2SH (Pay-to-Script-Hash)

If you've completed the main task and want an additional challenge, you can implement P2SH functionality. This is an advanced feature and is entirely optional.

To support P2SH, you would need to modify or implement the following methods:

1. `serializeScript`: Implement script serialization.
2. `deserializeScript`: Implement script deserialization.
3. `executeScript`: Modify to support P2SH execution.

P2SH allows the recipient of bitcoins to specify the script that must be used to spend those bitcoins. This is done by creating a hash of the redeem script and including that hash in the locking script.

## 6. Additional Notes

1. Pay attention to the order of operations and stack manipulation in Bitcoin Script.
2. Implement proper error handling for invalid stack states.

This exercise will help you understand the core operations of Bitcoin Script, a crucial component of Bitcoin's transaction validation process.
