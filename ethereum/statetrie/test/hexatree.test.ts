import { describe, it } from "mocha";
import { HexaTree, LeafNode, BranchNode } from "../src/hexatree";
import { expect } from "chai";
import { MemoryKVDB } from "../src/db";
import { createHash } from "crypto";

describe("HexaTree", () => {
  let trie: HexaTree;
  const ZERO_ROOT_HASH = "0x0000000000000000000000000000000000000000";

  beforeEach(() => {
    trie = new HexaTree(new MemoryKVDB());
  });

  describe("#set()", () => {
    it("should set value and return new root", async () => {
      const address = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, address, 100);
      expect(root).to.be.a("string");

      const value = await trie.get(root, address);
      expect(value).to.equal(100);
    });

    it("should update existing value", async () => {
      const address = "0x0000000000000000000000000000000000000001";
      let root = await trie.set(null, address, 100);
      root = await trie.set(root, address, 200);

      const value = await trie.get(root, address);
      expect(value).to.equal(200);
    });

    it("should handle multiple addresses", async () => {
      const addr1 = "0x0000000000000000000000000000000000000001";
      const addr2 = "0x0000000000000000000000000000000000000002";

      let root = await trie.set(null, addr1, 100);
      root = await trie.set(root, addr2, 200);

      expect(await trie.get(root, addr1)).to.equal(100);
      expect(await trie.get(root, addr2)).to.equal(200);
    });

    it("should handle addresses with similar hex paths", async () => {
      const findSimilarAddresses = () => {
        const addresses = [];
        let i = 1;
        while (addresses.length < 3) {
          const addr = `0x${i.toString(16).padStart(40, "0")}`;
          const hex = createHash("sha256").update(addr).digest("hex");
          if (addresses.length === 0) {
            addresses.push(addr);
          } else {
            const firstAddr = addresses[0];
            const firstHex = createHash("sha256").update(firstAddr).digest("hex");
            if (hex.substring(0, 3) === firstHex.substring(0, 3)) {
              addresses.push(addr);
            }
          }
          i++;
        }
        return addresses;
      };

      const [addr1, addr2, addr3] = findSimilarAddresses();

      let root = await trie.set(null, addr1, 100);
      root = await trie.set(root, addr2, 200);
      root = await trie.set(root, addr3, 300);

      expect(await trie.get(root, addr1)).to.equal(100);
      expect(await trie.get(root, addr2)).to.equal(200);
      expect(await trie.get(root, addr3)).to.equal(300);
    });
  });

  describe("#get()", () => {
    it("should return null for new address", async () => {
      const address = "0x0000000000000000000000000000000000000001";
      const value = await trie.get(ZERO_ROOT_HASH, address);
      expect(value).to.be.null;
    });

    it("should return correct value after setting", async () => {
      const address = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, address, 100);
      const value = await trie.get(root, address);
      expect(value).to.equal(100);
    });
  });

  describe("@Scenario: Bulk operations", () => {
    it("should handle bulk insertions and updates", async () => {
      const addresses = Array.from(
        { length: 100 },
        (_, i) => `0x${i.toString(16).padStart(40, "0")}`
      );

      let root = ZERO_ROOT_HASH;
      for (let i = 0; i < addresses.length; i++) {
        root = await trie.set(root, addresses[i], i * 100);
      }

      for (let i = 0; i < addresses.length; i++) {
        const value = await trie.get(root, addresses[i]);
        expect(value).to.equal(i * 100);
      }

      for (let i = 0; i < addresses.length; i += 2) {
        root = await trie.set(root, addresses[i], i * 200);
      }

      for (let i = 0; i < addresses.length; i++) {
        const value = await trie.get(root, addresses[i]);
        expect(value).to.equal(i % 2 === 0 ? i * 200 : i * 100);
      }
    });
  });

  describe("@Scenario: Consistency after multiple operations", () => {
    it("should maintain consistency after updates", async () => {
      const operations = [];
      let root = ZERO_ROOT_HASH;

      const addresses = Array.from(
        { length: 20 },
        (_, i) => `0x${(i * 123).toString(16).padStart(40, "0")}`
      );

      for (let i = 0; i < addresses.length; i++) {
        const value = Math.floor(Math.random() * 1000);
        root = await trie.set(root, addresses[i], value);
        operations.push({ addr: addresses[i], value });
      }

      for (let i = 0; i < 10; i++) {
        const idx = Math.floor(Math.random() * addresses.length);
        const newValue = Math.floor(Math.random() * 1000);
        root = await trie.set(root, addresses[idx], newValue);
        operations[idx].value = newValue;
      }

      for (const op of operations) {
        const value = await trie.get(root, op.addr);
        expect(value).to.equal(op.value);
      }
    });
  });
});

describe("LeafNode", () => {
  describe("#constructor", () => {
    it("should create a leaf node with key and value", () => {
      const node = new LeafNode("0x1234", 100);
      expect(node.key).to.equal("0x1234");
      expect(node.value).to.equal(100);
    });
  });

  describe("#serialize", () => {
    it("should serialize node data correctly", () => {
      const node = new LeafNode("0x1234", 100);
      const serialized = node.serialize();
      expect(serialized).to.be.instanceof(Buffer);
      expect(serialized[0]).to.equal(0); // Type identifier for leaf
    });
  });

  describe("#hash", () => {
    it("should generate consistent hash for same data", () => {
      const node1 = new LeafNode("0x1234", 100);
      const node2 = new LeafNode("0x1234", 100);
      expect(node1.hash()).to.equal(node2.hash());
    });

    it("should generate different hash for different data", () => {
      const node1 = new LeafNode("0x1234", 100);
      const node2 = new LeafNode("0x1234", 200);
      const node3 = new LeafNode("0x5678", 100);
      expect(node1.hash()).to.not.equal(node2.hash());
      expect(node1.hash()).to.not.equal(node3.hash());
    });
  });
});

describe("BranchNode", () => {
  describe("#constructor", () => {
    it("should create a branch node with children", () => {
      const children = [null, "0x1234", null, "0x5678"];
      const node = new BranchNode(children);
      expect(node.children).to.deep.equal(children);
    });
  });

  describe("#serialize", () => {
    it("should serialize node data correctly", () => {
      const node = new BranchNode([null, "0x1234", null]);
      const serialized = node.serialize();
      expect(serialized).to.be.instanceof(Buffer);
      expect(serialized[0]).to.equal(1); // Type identifier for branch
    });
  });

  describe("#hash", () => {
    it("should generate consistent hash for same data", () => {
      const children1 = [null, "0x1234", null];
      const children2 = [null, "0x1234", null];
      const node1 = new BranchNode(children1);
      const node2 = new BranchNode(children2);
      expect(node1.hash()).to.equal(node2.hash());
    });

    it("should generate different hash for different data", () => {
      const node1 = new BranchNode([null, "0x1234", null]);
      const node2 = new BranchNode([null, "0x5678", null]);
      const node3 = new BranchNode(["0x1234", null, null]);
      expect(node1.hash()).to.not.equal(node2.hash());
      expect(node1.hash()).to.not.equal(node3.hash());
    });
  });
});
