# Merkle Tree Implementation

## 1. Overview

This section focuses on completing the Merkle Tree implementation in TypeScript. Your specific task is to implement the `computeMerkleRoot` method in the existing `MerkleTree` class.

## 2. Test Description

The project includes a TypeScript test file (`merkletree.test.ts`) that verifies the Merkle Tree functionality. The tests specifically check if the `computeMerkleRoot` method correctly calculates the Merkle root.

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
4. Your goal is to implement the `computeMerkleRoot` method so that all tests pass.

## 4. What to Implement

Your task is to implement the following in the `merkletree.ts` file:

1. Complete the `computeMerkleRoot` method in the `MerkleTree` class:

   ```typescript
   private computeMerkleRoot(elements: string[]): string {
     // Your implementation here
   }
   ```

2. This method should take an array of leaf node hashes and return the Merkle root.

3. Your implementation should handle the following scenarios:

   a. Two leaves with the same root regardless of order:

   - When given two leaves, the resulting Merkle root should be the same regardless of their input order.
   - Example: `["a", "b"]` and `["b", "a"]` should produce the same root.
   - Implementation: When hashing two elements, compare them and always hash in a consistent order.

   b. Trees with an odd number of leaves:

   - When there's an odd number of elements at any level, the last element should be duplicated.
   - Example: For leaves `["a", "b", "c"]`, treat it as if it were `["a", "b", "c", "c"]` when computing the next level.
   - This ensures that every parent node always has two children.

   c. Empty tree:

   - Handle the case when the input array is empty. (Hint: Check the test for the expected behavior)

   d. Single leaf tree:

   - When there's only one leaf, it becomes the Merkle root.

4. Ensure your implementation passes all the test cases provided in `merkletree.test.ts`

## 5. Additional Notes

- The `MerkleTree.hash` static method is already implemented for you to use.
- Consider how to handle cases with odd and even numbers of elements at each level of the tree.
- Remember that the Merkle root is the top hash in a Merkle tree, representing all the transactions in a block.
- Don't modify any other parts of the class or the test file. Focus solely on implementing `computeMerkleRoot`.

This exercise will help you understand a crucial part of Merkle Tree construction, which is fundamental in many blockchain and distributed systems.
