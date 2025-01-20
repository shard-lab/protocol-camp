import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Node, Transaction, UTXO } from "../src/utxo";
import { Decimal } from "decimal.js";

describe("Basic Functionality Tests", () => {
  let node: Node;

  beforeEach(() => {
    node = new Node();
  });

  describe("getUTXOs", () => {
    it("should return unspent outputs from a genesis transaction", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 3 },
        { address: "Bob", amount: 2 },
      ]);
      node.executeTransaction(genesis);

      const aliceUtxos = node.getUTXOs("Alice");
      expect(aliceUtxos).to.have.lengthOf(1);
      expect(aliceUtxos[0].amount.toNumber()).to.eq(3);

      const bobUtxos = node.getUTXOs("Bob");
      expect(bobUtxos).to.have.lengthOf(1);
      expect(bobUtxos[0].amount.toNumber()).to.eq(2);
    });

    it("should exclude outputs that have been used as inputs in another transaction", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 3 },
      ]);
      node.executeTransaction(genesis);
      const tx = Transaction.create(
        [{ txId: genesis.id, vOut: 0 }],
        [
          { address: "Bob", amount: 2 },
          { address: "Alice", amount: 1 },
        ]
      );
      node.executeTransaction(tx);

      const aliceUtxos = node.getUTXOs("Alice");
      expect(aliceUtxos).to.have.lengthOf(1);
      expect(aliceUtxos[0].amount.toNumber()).to.eq(1);

      const bobUtxos = node.getUTXOs("Bob");
      expect(bobUtxos).to.have.lengthOf(1);
      expect(bobUtxos[0].amount.toNumber()).to.eq(2);
    });
  });

  describe("gatherInputs", () => {
    it("should gather enough UTXOs to cover the requested amount", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 0.5 },
        { address: "Alice", amount: 0.7 },
      ]);
      node.executeTransaction(genesis);

      const inputs = node.gatherInputs("Alice", 1.0);
      expect(inputs).to.have.length.greaterThan(0);

      let total = new Decimal(0);
      const utxos = node.getAllUTXOs();
      for (const input of inputs) {
        const found = utxos.find((u) => u.txId === input.txId && u.vOut === input.vOut);
        expect(found).to.exist;
        total = total.add(found!.amount);
      }
      expect(total.toNumber()).to.eq(1.2);
    });

    it("should throw an error when insufficient funds", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 0.3 },
      ]);
      node.executeTransaction(genesis);

      expect(() => node.gatherInputs("Alice", 0.5)).to.throw("Insufficient funds");
    });
  });

  describe("createOutputs", () => {
    it("should create recipient + leftover outputs if leftover > 0", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 2 },
      ]);
      node.executeTransaction(genesis);

      const inputs = node.gatherInputs("Alice", 1.2);
      const outData = node.createOutputs("Alice", "Bob", inputs, 1.2);
      expect(outData).to.have.lengthOf(2);

      const bobOut = outData.find((o) => o.address === "Bob");
      expect(bobOut).to.exist;
      expect(bobOut!.amount.toNumber()).to.eq(1.2);

      const aliceOut = outData.find((o) => o.address === "Alice");
      expect(aliceOut).to.exist;
      expect(aliceOut!.amount.toNumber()).to.eq(0.8);
    });

    it("should create only one output if leftover = 0", () => {
      const genesis = Transaction.create([], [
        { address: "Alice", amount: 1 },
      ]);
      node.executeTransaction(genesis);

      const inputs = node.gatherInputs("Alice", 1);
      const outData = node.createOutputs("Alice", "Bob", inputs, 1);
      expect(outData).to.have.lengthOf(1);
      expect(outData[0].address).to.eq("Bob");
      expect(outData[0].amount.toNumber()).to.eq(1);
    });
  });
});
