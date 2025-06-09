import { describe, it } from "mocha";
import { expect } from "chai";
import { MemoryKVDB } from "../src/db";
import { LeafNode, BranchNode } from "../src/hexatree";

describe("MemoryKVDB", () => {
  let db: MemoryKVDB;

  beforeEach(() => {
    db = new MemoryKVDB();
  });

  describe("#put()", () => {
    it("should store leaf node and return hash", async () => {
      const node = new LeafNode("0x1234", 100);
      const hash = await db.put(node);
      expect(hash).to.be.a("string");
      expect(hash).to.equal(node.hash());
    });

    it("should store branch node and return hash", async () => {
      const node = new BranchNode([null, null, "0x1234", null]);
      const hash = await db.put(node);
      expect(hash).to.be.a("string");
      expect(hash).to.equal(node.hash());
    });

    it("should return same hash for identical nodes", async () => {
      const leaf1 = new LeafNode("0x1234", 100);
      const leaf2 = new LeafNode("0x1234", 100);
      const hash1 = await db.put(leaf1);
      const hash2 = await db.put(leaf2);
      expect(hash1).to.equal(hash2);
    });
  });

  describe("#get()", () => {
    it("should return undefined for non-existent hash", async () => {
      const result = await db.get("0x1234");
      expect(result).to.be.undefined;
    });

    it("should retrieve stored leaf node", async () => {
      const node = new LeafNode("0x1234", 100);
      const hash = await db.put(node);
      const retrieved = await db.get(hash);
      expect(retrieved).to.deep.equal(node);
    });

    it("should retrieve stored branch node", async () => {
      const node = new BranchNode([null, "0x5678", null]);
      const hash = await db.put(node);
      const retrieved = await db.get(hash);
      expect(retrieved).to.deep.equal(node);
    });
  });

  describe("@Scenario: Multiple node operations", () => {
    it("should handle multiple nodes of different types", async () => {
      const leafNode = new LeafNode("0x1234", 100);
      const branchNode = new BranchNode([null, "0x5678", null, null]);

      const leafHash = await db.put(leafNode);
      const branchHash = await db.put(branchNode);

      const retrievedLeaf = await db.get(leafHash);
      const retrievedBranch = await db.get(branchHash);

      expect(retrievedLeaf).to.deep.equal(leafNode);
      expect(retrievedBranch).to.deep.equal(branchNode);
      expect(leafHash).to.not.equal(branchHash);
    });

    it("should maintain consistency with identical nodes", async () => {
      const branch1 = new BranchNode([null, "0x5678", null]);
      const branch2 = new BranchNode([null, "0x5678", null]);

      const hash1 = await db.put(branch1);
      const hash2 = await db.put(branch2);

      const retrieved1 = await db.get(hash1);
      const retrieved2 = await db.get(hash2);

      expect(hash1).to.equal(hash2);
      expect(retrieved1).to.deep.equal(retrieved2);
    });
  });
});
