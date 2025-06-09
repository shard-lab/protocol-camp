import { State, Transaction } from "../src/state";
import { expect } from "chai";

describe("#Ethereum State Hand-on Sessions", () => {
  let state: State;
  let initialBalances: Map<string, number>;

  beforeEach(() => {
    initialBalances = new Map<string, number>([
      ["Alice", 100],
      ["Bob", 50],
    ]);
    state = new State(initialBalances);
  });

  describe("apply()", () => {
    it("should apply a transaction to the working state without modifying the committed state", () => {
      const tx: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 30,
      };

      state.apply(tx);

      expect(state.getBalance("Alice")).to.equal(70);
      expect(state.getBalance("Bob")).to.equal(80);

      const committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(100);
      expect(committedState.get("Bob")).to.equal(50);
    });

    it("should throw an error if there is insufficient balance", () => {
      const tx: Transaction = {
        from: "Bob",
        to: "Alice",
        value: 60,
      };

      expect(() => state.apply(tx)).to.throw("Insufficient balance");
    });
  });

  describe("commit()", () => {
    it("should commit the working state to the committed state", () => {
      const tx: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 30,
      };

      state.apply(tx);
      state.commit();

      const committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(70);
      expect(committedState.get("Bob")).to.equal(80);

      expect(state.getBalance("Alice")).to.equal(70);
      expect(state.getBalance("Bob")).to.equal(80);
    });

    it("should have no effect if there is no working state", () => {
      state.commit();

      const committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(100);
      expect(committedState.get("Bob")).to.equal(50);
    });
  });

  describe("revert()", () => {
    it("should revert the working state and restore the committed state", () => {
      const tx: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 30,
      };

      state.apply(tx);

      expect(state.getBalance("Alice")).to.equal(70);
      expect(state.getBalance("Bob")).to.equal(80);

      state.revert();

      expect(state.getBalance("Alice")).to.equal(100);
      expect(state.getBalance("Bob")).to.equal(50);
    });

    it("should have no effect if there is no working state", () => {
      state.revert();

      const committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(100);
      expect(committedState.get("Bob")).to.equal(50);
    });
  });

  describe("Scenario Tests", () => {
    it("should correctly handle multiple apply and commit operations", () => {
      const tx1: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 40,
      };

      state.apply(tx1);

      expect(state.getBalance("Alice")).to.equal(60);
      expect(state.getBalance("Bob")).to.equal(90);

      let committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(100);
      expect(committedState.get("Bob")).to.equal(50);

      state.commit();

      committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(60);
      expect(committedState.get("Bob")).to.equal(90);

      const tx2: Transaction = {
        from: "Bob",
        to: "Charlie",
        value: 20,
      };

      state.apply(tx2);

      expect(state.getBalance("Bob")).to.equal(70);
      expect(state.getBalance("Charlie")).to.equal(20);

      committedState = state.getCommittedState();
      expect(committedState.get("Bob")).to.equal(90);
      expect(committedState.get("Charlie")).to.be.undefined;

      state.revert();

      expect(state.getBalance("Bob")).to.equal(90);
      expect(state.getBalance("Charlie")).to.equal(0);

      state.apply(tx2);
      state.commit();

      committedState = state.getCommittedState();
      expect(committedState.get("Bob")).to.equal(70);
      expect(committedState.get("Charlie")).to.equal(20);
    });

    it("should handle sequential transactions without committing", () => {
      const tx1: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 30,
      };

      const tx2: Transaction = {
        from: "Bob",
        to: "Alice",
        value: 20,
      };

      state.apply(tx1);
      state.apply(tx2);

      expect(state.getBalance("Alice")).to.equal(90); // 100 - 30 + 20
      expect(state.getBalance("Bob")).to.equal(60); // 50 + 30 - 20

      let committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(100);
      expect(committedState.get("Bob")).to.equal(50);

      state.commit();

      committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(90);
      expect(committedState.get("Bob")).to.equal(60);
    });

    it("should handle mixed apply, commit, and revert operations", () => {
      const tx1: Transaction = {
        from: "Alice",
        to: "Bob",
        value: 50,
      };

      const tx2: Transaction = {
        from: "Bob",
        to: "Charlie",
        value: 30,
      };

      state.apply(tx1);
      state.commit();

      let committedState = state.getCommittedState();
      expect(committedState.get("Alice")).to.equal(50);
      expect(committedState.get("Bob")).to.equal(100);

      state.apply(tx2);

      expect(state.getBalance("Bob")).to.equal(70);
      expect(state.getBalance("Charlie")).to.equal(30);

      state.revert();

      expect(state.getBalance("Bob")).to.equal(100);
      expect(state.getBalance("Charlie")).to.equal(0);

      state.apply(tx2);
      state.commit();

      committedState = state.getCommittedState();
      expect(committedState.get("Bob")).to.equal(70);
      expect(committedState.get("Charlie")).to.equal(30);
    });
  });
});
