import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Node, Transaction } from "../src/utxo";
import { Decimal } from "decimal.js";

describe("Basic Functionality Tests", () => {
  let node: Node;

  beforeEach(() => {
    node = new Node();
  });

  describe("getUTXOs", () => {
    it("should return unspent outputs from a genesis transaction", () => {
      const genesis = Transaction.create(
        [],
        [
          { address: "Alice", amount: 3 },
          { address: "Bob", amount: 2 },
        ]
      );
      node.transactions.push(genesis);

      const aliceUtxos = node.getUTXOs("Alice");
      expect(aliceUtxos).to.have.lengthOf(1);
      expect(aliceUtxos[0].amount.toNumber()).to.eq(3);

      const bobUtxos = node.getUTXOs("Bob");
      expect(bobUtxos).to.have.lengthOf(1);
      expect(bobUtxos[0].amount.toNumber()).to.eq(2);
    });

    it("should exclude outputs that have been used as inputs in another transaction", () => {
      const genesis = Transaction.create([], [{ address: "Alice", amount: 3 }]);
      node.transactions.push(genesis);
      node.send("Alice", "Bob", 2);

      const aliceUtxos = node.getUTXOs("Alice");
      expect(aliceUtxos).to.have.lengthOf(1);
      expect(aliceUtxos[0].amount.toNumber()).to.eq(1);

      const bobUtxos = node.getUTXOs("Bob");
      expect(bobUtxos).to.have.lengthOf(1);
      expect(bobUtxos[0].amount.toNumber()).to.eq(2);
    });
  });

  describe("executeTransaction", () => {
    it("should gather enough UTXOs to cover the requested amount", () => {
      const genesis = Transaction.create(
        [],
        [
          { address: "Alice", amount: 0.5 },
          { address: "Alice", amount: 0.7 },
        ]
      );
      node.transactions.push(genesis);
      const tx = node.send("Alice", "Bob", 1.0);

      for (const input of tx.inputs) {
        const utxo = node.getAllUTXOs().find((u) => u.txId === input.txId && u.vOut === input.vOut);
        expect(utxo).to.be.undefined;
      }
      expect(tx.outputs).to.have.lengthOf(2);

      const bobOut = tx.outputs.find((o) => o.address === "Bob");
      expect(bobOut).to.exist;
      expect(new Decimal(bobOut!.amount).toNumber()).to.eq(1.0);

      const aliceOut = tx.outputs.find((o) => o.address === "Alice");
      expect(aliceOut).to.exist;
      expect(new Decimal(aliceOut!.amount).toNumber()).to.eq(0.2);
    });

    it("should throw an error when insufficient funds", () => {
      const genesis = Transaction.create([], [{ address: "Alice", amount: 0.3 }]);
      node.transactions.push(genesis);

      expect(() => {
        node.send("Alice", "Bob", 0.5);
      }).to.throw("Invalid transaction: totalInput < totalOutput");
    });

    it("should create only one output if leftover = 0", () => {
      const genesis = Transaction.create([], [{ address: "Alice", amount: 1 }]);
      node.transactions.push(genesis);
      const tx = node.send("Alice", "Bob", 1);

      expect(tx.outputs).to.have.lengthOf(1);
      expect(tx.outputs[0].address).to.eq("Bob");
      expect(new Decimal(tx.outputs[0].amount).toNumber()).to.eq(1);
    });
  });
});
