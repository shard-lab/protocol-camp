import { describe, it } from "mocha";
import { State } from "../src/state";
import { expect } from "chai";
import { HexaTree } from "../src/hexatree";
import { MemoryKVDB } from "../src/db";

describe("State", () => {
  let trie: HexaTree;
  const ZERO_ROOT_HASH = "0x0000000000000000000000000000000000000000";

  beforeEach(() => {
    trie = new HexaTree(new MemoryKVDB());
  });

  describe("#getRoot()", () => {
    it("should return the current root hash", () => {
      const state = new State(ZERO_ROOT_HASH, trie);
      expect(state.getRoot()).to.equal(ZERO_ROOT_HASH);
    });
  });

  describe("#getBalance()", () => {
    it("should return zero for new address", async () => {
      const state = new State(ZERO_ROOT_HASH, trie);
      const address = "0x0000000000000000000000000000000000000001";
      const balance = await state.getBalance(address);
      expect(balance).to.equal(0);
    });

    it("should return correct balance after setting", async () => {
      const address = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, address, 100);
      const state = new State(root, trie);
      const balance = await state.getBalance(address);
      expect(balance).to.equal(100);
    });
  });

  describe("#apply()", () => {
    it("should process valid transaction", async () => {
      const from = "0x0000000000000000000000000000000000000000";
      const to = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, from, 200);
      const transactions = [
        {
          from: from,
          to: to,
          value: 100,
        },
      ];

      const state = new State(root, trie);
      const receipts = await state.apply(transactions);
      expect(receipts).to.be.an("array");
      expect(receipts.length).to.equal(1);
      expect(receipts[0].status).to.equal(1);
      expect(receipts[0].reason).to.be.undefined;

      const toBalance = await state.getBalance(to);
      expect(toBalance).to.equal(100);

      const fromBalance = await state.getBalance(from);
      expect(fromBalance).to.equal(100);
    });

    it("should fail with insufficient balance", async () => {
      const from = "0x0000000000000000000000000000000000000000";
      const to = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, from, 50);
      const transactions = [
        {
          from: from,
          to: to,
          value: 100,
        },
      ];

      const state = new State(root, trie);
      const receipts = await state.apply(transactions);
      expect(receipts[0].status).to.equal(0);
      expect(receipts[0].reason).to.equal("insufficient balance");
    });
  });

  describe("#commit()", () => {
    it("should persist changes to trie", async () => {
      const from = "0x0000000000000000000000000000000000000001";
      const to = "0x0000000000000000000000000000000000000002";
      const root = await trie.set(null, from, 200);
      const state = new State(root, trie);

      const fromBalance = await state.getBalance(from);
      expect(fromBalance).to.equal(200);

      await state.apply([{ from, to, value: 100 }]);
      const newRoot = await state.commit();
      const newState = new State(newRoot, trie);

      expect(await newState.getBalance(from)).to.equal(100);
      expect(await newState.getBalance(to)).to.equal(100);
    });
  });

  describe("#revert()", () => {
    it("should discard uncommitted changes", async () => {
      const from = "0x0000000000000000000000000000000000000000";
      const to = "0x0000000000000000000000000000000000000001";
      const root = await trie.set(null, from, 200);
      const state = new State(root, trie);

      await state.apply([{ from, to, value: 100 }]);
      state.revert();

      expect(await state.getBalance(from)).to.equal(200);
      expect(await state.getBalance(to)).to.equal(0);
    });
  });
});
