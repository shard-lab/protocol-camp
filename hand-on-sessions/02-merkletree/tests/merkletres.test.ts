import { MerkleTree } from "../src/merkletree";

describe("Merkle Tree Hand-on Session", () => {
  test("Generate a Empty tree", () => {
    const leaves: string[] = [];
    const tree = new MerkleTree(leaves);
    expect(tree.root).toBe("");
  });

  test("Generate a Single leaf Tree", () => {
    const leaves = ["a"];
    const tree = new MerkleTree(leaves);
    const expectedRoot =
      "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";
    expect(tree.root).toBe(expectedRoot);
  });

  // Hint: The two leaves are compared numerically before combining their hash.
  // Regardless of the input order, the leaf values are compared as numbers and combined accordingly.
  test("Generate Two leaves Tree", () => {
    const leaves = ["a", "b"];
    const leaves2 = ["b", "a"];
    const tree = new MerkleTree(leaves);
    const tree2 = new MerkleTree(leaves2);
    const expectedRoot =
      "ab19ec537f09499b26f0f62eed7aefad46ab9f498e06a7328ce8e8ef90da6d86";

    expect(tree.root).toBe(expectedRoot);
    expect(tree2.root).toBe(expectedRoot);
  });

  // Hint: When the number of leaves is odd, the last leaf is duplicated to make the count even.
  // "c" is duplicated in this case to ensure the tree structure is complete.
  test("Generate an Odd Number of leaves Tree", () => {
    const leaves = ["a", "b", "c"];
    const leaves2 = ["a", "b", "c", "c"];
    const tree = new MerkleTree(leaves);
    const tree2 = new MerkleTree(leaves2);

    const expectedRoot =
      "69b606bf5ab36a173feea06d34d379564dc24fcb4b4302ca4b07a4cf58af5d0c";

    expect(tree.root).toBe(expectedRoot);
    expect(tree2.root).toBe(expectedRoot);
  });

  test("Generate a tree", () => {
    const leaves = ["a", "b", "c", "d"];
    const tree = new MerkleTree(leaves);
    expect(tree.root).toBe(
      "7ab33be6039bf251a90a1f1667f77860dcd939fc87e7cf61cfcbb49c812370d4"
    );
  });

  test("Verify a proof for non-existent leaf", () => {
    const leaves = ["a", "b", "c", "d"];
    const tree = new MerkleTree(leaves);

    const fakeLeaf = "x";
    const proof = tree.getProof(0);

    const isValid = tree.verifyProof(fakeLeaf, proof);
    expect(isValid).toBe(false);
  });

  test("Verify All leaves with proof verification", () => {
    const leaves = ["a", "b", "c", "d", "e"];
    const tree = new MerkleTree(leaves);

    for (let i = 0; i < leaves.length; i++) {
      const proof = tree.getProof(i);
      const isValid = tree.verifyProof(leaves[i], proof);
      expect(isValid).toBe(true);
    }
  });
});
