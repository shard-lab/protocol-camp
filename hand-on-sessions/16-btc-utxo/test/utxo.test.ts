import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import Decimal from "decimal.js";
import { Transaction, Wallet, UTXO } from "../src/utxo";

interface TestScenario {
  name: string;           // case name
  aliceUtxos: number[];   // Alice's UTXO
  bobUtxos: number[];     // Bob's UTXO
  sendAmount: number;     // send amount
  expectedInputAmount: number; // final Alice's balance
  expectedAliceBalance: number; // final Alice's balance
  expectedBobBalance: number;   // final Bob's balance
}

const successScenarios: TestScenario[] = [
  {
    name: "Case 1: Alice(0.5, 0.7) -> Bob(0), send 1.0",
    aliceUtxos: [0.5, 0.7],
    bobUtxos: [],
    sendAmount: 1.0,
    expectedInputAmount: 1.2,
    expectedAliceBalance: 0.2,
    expectedBobBalance: 1.0,
  },
  {
    name: "Case 2: Alice(2.0) -> Bob(0), send 1.2",
    aliceUtxos: [2.0],
    bobUtxos: [],
    sendAmount: 1.2,
    expectedInputAmount: 2.0,
    expectedAliceBalance: 0.8,
    expectedBobBalance: 1.2,
  },
  {
    name: "Case 3: Alice(0.3, 0.2) -> Bob(0), send 0.5",
    aliceUtxos: [0.3, 0.2],
    bobUtxos: [],
    sendAmount: 0.5,
    expectedInputAmount: 0.5,
    expectedAliceBalance: 0.0,
    expectedBobBalance: 0.5,
  },
  {
    name: "Case 4: Alice(0.5, 0.7) -> Bob(0.3), send 0.3",
    aliceUtxos: [0.5, 0.7],
    bobUtxos: [0.3],
    sendAmount: 0.3,
    expectedInputAmount: 0.5,
    expectedAliceBalance: 0.9,
    expectedBobBalance: 0.6,
  },
];

describe("Success Cases", () => {
  successScenarios.forEach((scenario) => {
    describe(scenario.name, () => {
      let alice: Wallet;
      let bob: Wallet;
      let tx: Transaction;

      beforeEach(() => {
        alice = new Wallet(
          "Alice",
          scenario.aliceUtxos.map((amt) => new UTXO("Alice", amt))
        );
        bob = new Wallet(
          "Bob",
          scenario.bobUtxos.map((amt) => new UTXO("Bob", amt))
        );
        tx = new Transaction(alice, bob, scenario.sendAmount);
      });

      it("1) collectInputs", () => {
        tx.collectInputs();
        expect(tx.inputs).to.be.an("array").that.is.not.empty;

        const total = tx.getTotalInputAmount();
        expect(total.toNumber()).to.be.eq(scenario.expectedInputAmount);
      });

      it("2) validateTransaction", () => {
        tx.collectInputs();
        tx.validateTransaction();
      });


      it("3.1) createOutputs - check sender's utxos", () => {
        tx.collectInputs();
        tx.validateTransaction();
        tx.createOutputs();
          const bobOutput = tx.outputs.find((o) => o.owner === "Bob");
          expect(bobOutput).to.exist;
          expect(bobOutput!.amount.toNumber()).to.equal(scenario.sendAmount);
      });

      it("3.2) createOutputs - check recipient's utxos", () => {
        tx.collectInputs();
        tx.validateTransaction();
        tx.createOutputs();
          const totalInput = tx.getTotalInputAmount();
          const leftover = totalInput.minus(scenario.sendAmount);

          if (leftover.greaterThan(0)) {
            const aliceOutput = tx.outputs.find((o) => o.owner === "Alice");
            expect(aliceOutput).to.exist;
            expect(aliceOutput!.amount.toNumber()).to.equal(leftover.toNumber());
          }
      });

      it("4) applyTransaction", () => {
        tx.collectInputs();
        tx.validateTransaction();
        tx.createOutputs();
        tx.applyTransaction();

        const aliceBalance = alice.getBalance();
        expect(aliceBalance.toNumber()).to.equal(scenario.expectedAliceBalance);

        const bobBalance = bob.getBalance();
        expect(bobBalance.toNumber()).to.equal(scenario.expectedBobBalance);
      });

      it("5) execute()", () => {
        tx.execute();
        const aliceBalance = alice.getBalance();
        expect(aliceBalance.toNumber()).to.equal(scenario.expectedAliceBalance);
        const bobBalance = bob.getBalance();
        expect(bobBalance.toNumber()).to.equal(scenario.expectedBobBalance);
      });
    });
  });
});

const failScenarios: TestScenario[] = [
  {
    name: "Case 1: Alice(0.1, 0.2) -> Bob(0), send 0.5",
    aliceUtxos: [0.1, 0.2],
    bobUtxos: [],
    sendAmount: 0.5,
    expectedInputAmount: 0.3,
    expectedAliceBalance: 0.3,
    expectedBobBalance: 0,
  },
];

describe("Fail Cases", () => {
  failScenarios.forEach((scenario) => {
    describe(scenario.name, () => {
      let alice: Wallet;
      let bob: Wallet;
      let tx: Transaction;

      beforeEach(() => {
        alice = new Wallet(
          "Alice",
          scenario.aliceUtxos.map((amt) => new UTXO("Alice", amt))
        );
        bob = new Wallet(
          "Bob",
          scenario.bobUtxos.map((amt) => new UTXO("Bob", amt))
        );
        tx = new Transaction(alice, bob, scenario.sendAmount);
      });

      it("1) collectInputs", () => {
        tx.collectInputs();
        expect(tx.inputs).to.be.an("array").that.is.not.empty;
        const total = tx.getTotalInputAmount();
        expect(total.toNumber()).to.be.eq(scenario.expectedInputAmount);
      });

      it("2) validateTransaction", () => {
        tx.collectInputs();
        expect(() => tx.validateTransaction()).to.throw();
      });

      it("3) createOutputs", () => {
        expect(() => {
          tx.collectInputs();
          tx.validateTransaction();
          tx.createOutputs();
        }).to.throw(); 
      });

      it("4) applyTransaction", () => {
        expect(() => {
          tx.collectInputs();
          tx.validateTransaction();
          tx.createOutputs();
          tx.applyTransaction();
        }).to.throw();
      });

      it("5) execute()", () => {
        expect(() => {
          tx.execute();
        }).to.throw();
      });
    });
  });
});
