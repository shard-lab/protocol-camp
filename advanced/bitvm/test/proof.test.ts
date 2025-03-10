import { expect } from "chai";
import { Proof } from "../src/proof";
import { NandNode, Leaf } from "../src/gate";

describe("ProofNode", () => {
  it("should create a ProofNode with correct bitcommitment for a Leaf", () => {
    // Create a leaf node with value true
    const leafGate = new Leaf(true);
    const proofNode = new Proof(leafGate);

    expect(proofNode.id).to.equal(0);
    expect(proofNode.bitcommitment.bit).to.equal(true);
  });

  it("should create a ProofNode with correct structure for a NandNode", () => {
    // Create a NAND gate with two leaf nodes
    const leaf1 = new Leaf(true);
    const leaf2 = new Leaf(true);

    const nandGate = new NandNode(leaf1, leaf2);
    const proofNode = new Proof(nandGate);

    // Check if the node has the correct structure
    expect(proofNode.id).to.equal(0);
    expect(proofNode.bitcommitment.bit).to.equal(false); // NAND(true, true) = false
    expect(proofNode.left).to.exist;
    expect(proofNode.right).to.exist;

    // Check left child
    expect(proofNode.left?.id).to.equal(1);
    expect(proofNode.left?.bitcommitment.bit).to.equal(true);

    // Check right child
    expect(proofNode.right?.id).to.equal(2);
    expect(proofNode.right?.bitcommitment.bit).to.equal(true);
  });

  it("should create a complex tree of ProofNodes for nested NAND gates", () => {
    // Create a more complex circuit: NAND(NAND(true, false), false)
    const leaf1 = new Leaf(true);
    const leaf2 = new Leaf(false);
    const leaf3 = new Leaf(false);

    // NAND(NAND(true, false), false)
    const nand = new NandNode(new NandNode(leaf1, leaf2), leaf3);
    const proofNode = new Proof(nand);

    // Check the root node
    expect(proofNode.id).to.equal(0);
    expect(proofNode.bitcommitment.bit).to.equal(true); // NAND(true, false) = true, NAND(true, false) = false

    // Check the left child (inner NAND)
    expect(proofNode.left?.id).to.equal(1);
    expect(proofNode.left?.bitcommitment.bit).to.equal(true); // NAND(true, false) = true

    // Check the grandchildren
    expect(proofNode.left?.left?.id).to.equal(3);
    expect(proofNode.left?.left?.bitcommitment.bit).to.equal(true);

    expect(proofNode.left?.right?.id).to.equal(4);
    expect(proofNode.left?.right?.bitcommitment.bit).to.equal(false);

    // Check the right child
    expect(proofNode.right?.id).to.equal(2);
    expect(proofNode.right?.bitcommitment.bit).to.equal(false);
  });

  it("should create valid preimages in bitcommitment", () => {
    const leafGate = new Leaf(true);
    const proofNode = new Proof(leafGate);

    // Verify that preimages are valid hashes
    expect(proofNode.bitcommitment.preimage0).to.be.a("string");
    expect(proofNode.bitcommitment.preimage0).to.have.length(64); // SHA-256 hash is 64 hex chars

    expect(proofNode.bitcommitment.preimage1).to.be.a("string");
    expect(proofNode.bitcommitment.preimage1).to.have.length(64);
  });
});
