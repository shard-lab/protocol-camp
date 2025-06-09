import { Leaf } from "../../src/gate";
import { expect } from "chai";

describe("Leaf", () => {
  describe("Leaf", () => {
    it("should evaluate to true when created with true", () => {
      expect(Leaf.true().evaluate()).to.equal(true);
    });

    it("should evaluate to false when created with false", () => {
      expect(Leaf.false().evaluate()).to.equal(false);
    });

    it("should convert to string correctly", () => {
      expect(Leaf.true().toString()).to.equal("1");
      expect(Leaf.false().toString()).to.equal("0");
    });
  });
});
