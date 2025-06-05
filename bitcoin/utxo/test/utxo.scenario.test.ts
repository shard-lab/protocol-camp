import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Node, Transaction } from "../src/utxo";

describe("Scenario Tests", () => {
  let node: Node;

  beforeEach(() => {
    node = new Node();
  });

  it("Success Scenario: Alice -> Bob 2.5", () => {
    const genesis = Transaction.create(
      [],
      [
        { address: "Alice", amount: 3 },
        { address: "Bob", amount: 2 },
      ]
    );
    node.transactions.push(genesis);
    node.send("Alice", "Bob", 2.5);

    const aliceUtxos = node.getUTXOs("Alice");
    expect(aliceUtxos).to.have.lengthOf(1);
    expect(aliceUtxos[0].amount.toNumber()).to.eq(0.5);

    const bobUtxos = node.getUTXOs("Bob");
    expect(bobUtxos.length).to.eq(2);
    const totalBob = bobUtxos.reduce((acc, u) => acc + u.amount.toNumber(), 0);
    expect(totalBob).to.eq(4.5);
  });

  it("Success Scenario: Check spent outputs are excluded", () => {
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

  it("Success Scenario: multiple transfers", () => {
    const genesis = Transaction.create([], [{ address: "Alice", amount: 5 }]);
    node.transactions.push(genesis);
    node.send("Alice", "Bob", 2);
    node.send("Bob", "Charlie", 1.5);

    const aliceUtxos = node.getUTXOs("Alice");
    expect(aliceUtxos[0].amount.toNumber()).to.eq(3);

    const bobUtxos = node.getUTXOs("Bob");
    expect(bobUtxos[0].amount.toNumber()).to.eq(0.5);

    const charlieUtxos = node.getUTXOs("Charlie");
    expect(charlieUtxos[0].amount.toNumber()).to.eq(1.5);
  });

  it("Failure Scenario: insufficient funds", () => {
    const genesis = Transaction.create([], [{ address: "Alice", amount: 1 }]);
    node.transactions.push(genesis);
    expect(() => {
      node.send("Alice", "Bob", 2);
    }).to.throw("Invalid transaction: totalInput < totalOutput");
  });
});
