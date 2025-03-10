import { expect } from "chai";
import { toBit4, fromBit4, add } from "../../src/u4";

describe("4-bit Addition", () => {
  describe("add", () => {
    it("should add 0 + 0 = 0", () => {
      const x = toBit4(0);
      const y = toBit4(0);
      const [result, overflow] = add(x, y);
      expect(fromBit4(result)).to.equal(0);
      expect(overflow.evaluate()).to.be.false;
    });

    it("should add 5 + 3 = 8", () => {
      const x = toBit4(5);
      const y = toBit4(3);
      const [result, overflow] = add(x, y);
      expect(fromBit4(result)).to.equal(8);
      expect(overflow.evaluate()).to.be.false;
    });

    it("should add 7 + 8 = 15", () => {
      const x = toBit4(7);
      const y = toBit4(8);
      const [result, overflow] = add(x, y);
      expect(fromBit4(result)).to.equal(15);
      expect(overflow.evaluate()).to.be.false;
    });

    it("should throw error on overflow (8 + 8 = 16)", () => {
      const x = toBit4(8);
      const y = toBit4(8);
      const [result, overflow] = add(x, y);
      expect(fromBit4(result)).to.equal(0);
      expect(overflow.evaluate()).to.be.true;
    });

    it("should throw error on overflow (15 + 1 = 16)", () => {
      const x = toBit4(15);
      const y = toBit4(1);
      const [result, overflow] = add(x, y);
      expect(fromBit4(result)).to.equal(0);
      expect(overflow.evaluate()).to.be.true;
    });
  });
});
