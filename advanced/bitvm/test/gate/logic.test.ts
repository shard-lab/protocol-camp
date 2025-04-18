import { Leaf, NandNode, NOT, AND, OR, XOR } from "../../src/gate";
import { expect } from "chai";

describe("Logic Gates", () => {
  describe("NAND", () => {
    it("should implement NAND truth table", () => {
      const tt = Leaf.true();
      const tf = Leaf.false();

      expect(new NandNode(tf, tf).evaluate()).to.equal(true);
      expect(new NandNode(tf, tt).evaluate()).to.equal(true);
      expect(new NandNode(tt, tf).evaluate()).to.equal(true);
      expect(new NandNode(tt, tt).evaluate()).to.equal(false);
    });

    it("should convert to string correctly", () => {
      const a = Leaf.true();
      const b = Leaf.false();
      expect(new NandNode(a, b).toString()).to.equal("NAND(1, 0)");
    });
  });

  describe("NOT", () => {
    it("should invert input", () => {
      expect(NOT(Leaf.true()).evaluate()).to.equal(false);
      expect(NOT(Leaf.false()).evaluate()).to.equal(true);
    });

    it("should convert to string correctly", () => {
      const a = Leaf.true();
      expect(NOT(a).toString()).to.equal("NAND(1, 1)");
    });
  });

  describe("AND", () => {
    it("should implement AND truth table", () => {
      const tt = Leaf.true();
      const tf = Leaf.false();

      expect(AND(tf, tf).evaluate()).to.equal(false);
      expect(AND(tf, tt).evaluate()).to.equal(false);
      expect(AND(tt, tf).evaluate()).to.equal(false);
      expect(AND(tt, tt).evaluate()).to.equal(true);
    });

    it("should convert to string correctly", () => {
      const a = Leaf.true();
      const b = Leaf.false();
      expect(AND(a, b).toString()).to.equal("NAND(NAND(1, 0), NAND(1, 0))");
    });
  });

  describe("OR", () => {
    it("should implement OR truth table", () => {
      const tt = Leaf.true();
      const tf = Leaf.false();

      expect(OR(tf, tf).evaluate()).to.equal(false);
      expect(OR(tf, tt).evaluate()).to.equal(true);
      expect(OR(tt, tf).evaluate()).to.equal(true);
      expect(OR(tt, tt).evaluate()).to.equal(true);
    });

    it("should convert to string correctly", () => {
      const a = Leaf.true();
      const b = Leaf.false();
      expect(OR(a, b).toString()).to.equal("NAND(NAND(1, 1), NAND(0, 0))");
    });
  });

  describe("XOR", () => {
    it("should implement XOR truth table", () => {
      const tt = Leaf.true();
      const tf = Leaf.false();

      expect(XOR(tf, tf).evaluate()).to.equal(false);
      expect(XOR(tf, tt).evaluate()).to.equal(true);
      expect(XOR(tt, tf).evaluate()).to.equal(true);
      expect(XOR(tt, tt).evaluate()).to.equal(false);
    });

    it("should convert to string correctly", () => {
      const a = Leaf.true();
      const b = Leaf.false();
      expect(XOR(a, b).toString()).to.equal("NAND(NAND(1, NAND(0, 0)), NAND(NAND(1, 1), 0))");
    });
  });
});
