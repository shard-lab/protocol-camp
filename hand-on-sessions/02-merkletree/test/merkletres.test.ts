import { MerkleTree } from "../src/merkletree";
import { assert } from "chai";

describe("#Merkle Tree Hands-on Session", () => {
  it("should generate an empty tree", () => {
    const leaves: string[] = [];
    const tree = new MerkleTree(leaves);
    assert.equal(tree.root, "");
  });

  it("should generate a single leaf tree", () => {
    const leaves = ["a"];
    const tree = new MerkleTree(leaves);
    const expectedRoot =
      "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";
    assert.equal(tree.root, expectedRoot);
  });

  it("should generate two leaves tree with same root regardless of order", () => {
    const leaves = ["a", "b"];
    const leaves2 = ["b", "a"];
    const tree = new MerkleTree(leaves);
    const tree2 = new MerkleTree(leaves2);
    const expectedRoot =
      "ab19ec537f09499b26f0f62eed7aefad46ab9f498e06a7328ce8e8ef90da6d86";

    assert.equal(tree.root, expectedRoot);
    assert.equal(tree2.root, expectedRoot);
  });

  it("should generate a tree with an odd number of leaves", () => {
    const leaves = ["a", "b", "c"];
    const leaves2 = ["a", "b", "c", "c"];
    const tree = new MerkleTree(leaves);
    const tree2 = new MerkleTree(leaves2);

    const expectedRoot =
      "69b606bf5ab36a173feea06d34d379564dc24fcb4b4302ca4b07a4cf58af5d0c";

    assert.equal(tree.root, expectedRoot);
    assert.equal(tree2.root, expectedRoot);
  });

  it("should generate a tree", () => {
    const leaves = ["a", "b", "c", "d"];
    const tree = new MerkleTree(leaves);
    assert.equal(
      tree.root,
      "7ab33be6039bf251a90a1f1667f77860dcd939fc87e7cf61cfcbb49c812370d4"
    );
  });

  it("should not verify a proof for a non-existent leaf", () => {
    const leaves = ["a", "b", "c", "d"];
    const tree = new MerkleTree(leaves);

    const fakeLeaf = "x";
    const proof = tree.getProof(0);

    const isValid = tree.verifyProof(fakeLeaf, proof);
    assert.isFalse(isValid);
  });

  it("should verify all leaves with proof verification", () => {
    const leaves = ["a", "b", "c", "d", "e"];
    const tree = new MerkleTree(leaves);

    for (let i = 0; i < leaves.length; i++) {
      const proof = tree.getProof(i);
      const isValid = tree.verifyProof(leaves[i], proof);
      assert.isTrue(isValid);
    }
  });
});
