import { expect } from "chai";
import { Taproot } from "../src/taproot";
import { Proof } from "../src/proof";
import { NandNode, Leaf } from "../src/gate/nand";

describe("Taproot", () => {
  it("should create a Taproot structure with correct properties", () => {
    // Create a simple NAND circuit: NAND(true, false)
    const leaf1 = new Leaf(true);
    const leaf2 = new Leaf(false);
    const nandGate = new NandNode(leaf1, leaf2);

    // Create a proof tree from the NAND gate
    const proofNode = new Proof(nandGate);

    // Create a Taproot structure from the proof tree
    const taproot = new Taproot(proofNode);

    // Verify the Taproot structure has the expected properties
    expect(taproot.scripts.length).to.equal(1); // One NAND gate
    expect(taproot.leaves.length).to.equal(1); // One leaf hash
    expect(taproot.hash).to.equal(taproot.leaves[0]); // With one leaf, root equals the leaf
  });

  it("should create a Taproot structure for a complex circuit", () => {
    // Create a more complex circuit: NAND(NAND(true, false), false)
    const leaf1 = new Leaf(true);
    const leaf2 = new Leaf(false);
    const leaf3 = new Leaf(false);
    const innerNand = new NandNode(leaf1, leaf2);
    const outerNand = new NandNode(innerNand, leaf3);

    // Create a proof tree from the complex NAND circuit
    const proofNode = new Proof(outerNand);

    // Create a Taproot structure from the proof tree
    const taproot = new Taproot(proofNode);

    // Verify the Taproot structure has the expected properties
    expect(taproot.scripts).to.be.an("array");
    expect(taproot.scripts.length).to.equal(2); // Two NAND gates
    expect(taproot.leaves).to.be.an("array");
    expect(taproot.leaves.length).to.equal(2); // Two leaf hashes
    expect(taproot.hash).to.be.a("string");
  });

  it("should handle an empty tree case", () => {
    // Create a leaf node (not a NAND gate)
    const leaf = new Leaf(true);
    const proofNode = new Proof(leaf);

    // Create a Taproot structure from a tree with no NAND gates
    const taproot = new Taproot(proofNode);

    // Verify the Taproot structure has the expected properties for an empty tree
    expect(taproot.scripts).to.be.an("array");
    expect(taproot.scripts.length).to.equal(0); // No NAND gates
    expect(taproot.leaves).to.be.an("array");
    expect(taproot.leaves.length).to.equal(0); // No leaf hashes
    expect(taproot.hash).to.be.a("string");
    expect(taproot.hash).to.equal("0".padEnd(64, "0")); // Empty tree hash
  });

  it("should correctly compute Merkle root for odd number of leaves", () => {
    // Create three NAND gates in a specific structure to get 3 leaves
    const leaf1 = new Leaf(true);
    const leaf2 = new Leaf(false);
    const leaf3 = new Leaf(true);
    const leaf4 = new Leaf(false);

    // NAND(NAND(true, false), NAND(true, false))
    const nand1 = new NandNode(leaf1, leaf2);
    const nand2 = new NandNode(leaf3, leaf4);
    const nand3 = new NandNode(nand1, nand2);

    const proofNode = new Proof(nand3);
    const taproot = new Taproot(proofNode);

    // Verify we have 3 NAND gates
    expect(taproot.scripts.length).to.equal(3);
    expect(taproot.leaves.length).to.equal(3);
    expect(taproot.hash).to.be.a("string");
  });
});
