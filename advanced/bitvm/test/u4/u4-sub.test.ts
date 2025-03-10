import { expect } from "chai";
import { toBit4, fromBit4, sub } from "../../src/u4";

describe("4-bit Subtraction", () => {
  describe("sub", () => {
    it("should subtract 5 - 3 = 2", () => {
      const x = toBit4(5); // 0101
      const y = toBit4(3); // 0011
      const [result, borrow] = sub(x, y);
      expect(fromBit4(result)).to.equal(2); // 0010
      expect(borrow.evaluate()).to.be.false;
    });

    it("should subtract 10 - 4 = 6", () => {
      const x = toBit4(10); // 1010
      const y = toBit4(4); // 0100
      const [result, borrow] = sub(x, y);
      expect(fromBit4(result)).to.equal(6); // 0110
      expect(borrow.evaluate()).to.be.false;
    });

    it("should handle subtraction with zero", () => {
      const x = toBit4(7); // 0111
      const y = toBit4(0); // 0000
      const [result, borrow] = sub(x, y);
      expect(fromBit4(result)).to.equal(7); // 0111
      expect(borrow.evaluate()).to.be.false;
    });

    it("should handle zero result", () => {
      const x = toBit4(8); // 1000
      const y = toBit4(8); // 1000
      const [result, borrow] = sub(x, y);
      expect(fromBit4(result)).to.equal(0); // 0000
      expect(borrow.evaluate()).to.be.false;
    });

    it("should handle borrowing correctly", () => {
      const x = toBit4(3); // 0011
      const y = toBit4(5); // 0101
      const [result, borrow] = sub(x, y);
      // In 4-bit arithmetic, 3 - 5 = -2 (14 in unsigned)
      // 3 = 0011
      // 5 = 0101
      // -5 = 1011 (two's complement)
      // 3 + (-5) = 1110 = 14
      expect(fromBit4(result)).to.equal(14); // 1110
      expect(borrow.evaluate()).to.be.true; // Borrow needed since 3 < 5
    });
  });
});
