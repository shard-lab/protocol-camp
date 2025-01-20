import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Decimal } from "decimal.js";
import { Node, Transaction } from "../src/utxo";

interface Scenario {
  name: string;
  initialTxs: Transaction[];
  action: { sender: string; recipient: string; amount: number };
  expectedBalances?: Record<string, number>; // { Alice: 0.5, Bob: 0.2, Carol: 3.0, Dave: 1.2, ... }
  shouldFail?: boolean;
}

describe("Scenario Tests (with multiple addresses)", () => {
  let node: Node;

  beforeEach(() => {
    node = new Node();
  });

  const successScenarios: Scenario[] = [
    {
      name: "Case1: Alice(1.5), Carol(2.0) -> Alice->Carol 1.0",
      initialTxs: [
        Transaction.create([], [{ address: "Alice", amount: 1.5 }]),
        Transaction.create([], [{ address: "Carol", amount: 2.0 }]),
      ],
      action: { sender: "Alice", recipient: "Carol", amount: 1.0 },
      expectedBalances: {
        Alice: 0.5,  // leftover
        Carol: 3.0,  // 2.0 + 1.0
      },
    },
    {
      name: "Case2: Bob(0.7,1.0), Carol(0.5) -> Bob->Carol 1.5",
      initialTxs: [
        Transaction.create([], [
          { address: "Bob", amount: 0.7 },
          { address: "Bob", amount: 1.0 },
        ]),
        Transaction.create([], [{ address: "Carol", amount: 0.5 }]),
      ],
      action: { sender: "Bob", recipient: "Carol", amount: 1.5 },
      expectedBalances: {
        Bob: 0.2,   // leftover
        Carol: 2.0, // 0.5 + 1.5
      },
    },
    {
      name: "Case3: Alice(1.2), Bob(0.3), Carol(1.5), Dave(2.0) -> Alice->Dave 1.0",
      initialTxs: [
        Transaction.create([], [{ address: "Alice", amount: 1.2 }]),
        Transaction.create([], [{ address: "Bob", amount: 0.3 }]),
        Transaction.create([], [{ address: "Carol", amount: 1.5 }]),
        Transaction.create([], [{ address: "Dave", amount: 2.0 }]),
      ],
      action: { sender: "Alice", recipient: "Dave", amount: 1.0 },
      expectedBalances: {
        Alice: 0.2,   // leftover
        Bob: 0.3,     // untouched
        Carol: 1.5,   // untouched
        Dave: 3.0,    // 2.0 + 1.0
      },
    },
    {
      name: "Case4: Alice(2.5), Bob(2.0), Carol(0.5), Dave(1.5) -> Bob->Carol 1.4",
      initialTxs: [
        Transaction.create([], [{ address: "Alice", amount: 2.5 }]),
        Transaction.create([], [{ address: "Bob", amount: 2.0 }]),
        Transaction.create([], [{ address: "Carol", amount: 0.5 }]),
        Transaction.create([], [{ address: "Dave", amount: 1.5 }]),
      ],
      action: { sender: "Bob", recipient: "Carol", amount: 1.4 },
      expectedBalances: {
        Alice: 2.5, // untouched
        Bob: 0.6,   // leftover (2.0 - 1.4)
        Carol: 1.9, // 0.5 + 1.4
        Dave: 1.5,  // untouched
      },
    },
  ];

  const failScenarios: Scenario[] = [
    {
      name: "Case1: Alice(0.2) -> Carol 0.5 (Insufficient)",
      initialTxs: [
        Transaction.create([], [{ address: "Alice", amount: 0.2 }]),
      ],
      action: { sender: "Alice", recipient: "Carol", amount: 0.5 },
      shouldFail: true,
    },
    {
      name: "Case2: Bob(0) -> Alice 0.5 (Bob has nothing)",
      initialTxs: [],
      action: { sender: "Bob", recipient: "Alice", amount: 0.5 },
      shouldFail: true,
    },
  ];

  describe("Success Scenarios", () => {
    successScenarios.forEach((scenario) => {
      it(scenario.name, () => {
        scenario.initialTxs.forEach((tx) => node.executeTransaction(tx));

        node.processTransaction(
          scenario.action.sender,
          scenario.action.recipient,
          scenario.action.amount
        );

        if (scenario.expectedBalances) {
          for (const addr of Object.keys(scenario.expectedBalances)) {
            const balance = node
              .getUTXOs(addr)
              .reduce((acc, cur) => acc.add(cur.amount), new Decimal(0))
              .toNumber();

            expect(balance).to.eq(scenario.expectedBalances[addr]);
          }
        }
      });
    });
  });

  describe("Fail Scenarios", () => {
    failScenarios.forEach((scenario) => {
      it(scenario.name, () => {
        scenario.initialTxs.forEach((tx) => node.executeTransaction(tx));

        expect(() =>
          node.processTransaction(
            scenario.action.sender,
            scenario.action.recipient,
            scenario.action.amount
          )
        ).to.throw();
      });
    });
  });
});
