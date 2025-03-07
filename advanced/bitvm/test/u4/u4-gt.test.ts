import { expect } from "chai";
import { toBit4, gt } from "../../src/u4";

describe("4-bit Greater Than", () => {
  describe("gt", () => {
    it("should return false for 0 > 0", () => {
      const x = toBit4(0);
      const y = toBit4(0);
      expect(gt(x, y).evaluate()).to.be.false;
    });

    it("should return true for 5 > 3", () => {
      const x = toBit4(5);
      const y = toBit4(3);
      expect(gt(x, y).evaluate()).to.be.true;
    });

    it("should return false for 3 > 5", () => {
      const x = toBit4(3);
      const y = toBit4(5);
      expect(gt(x, y).evaluate()).to.be.false;
    });

    it("should return true for 15 > 0", () => {
      const x = toBit4(15);
      const y = toBit4(0);
      expect(gt(x, y).evaluate()).to.be.true;
    });

    it("should return false for 0 > 15", () => {
      const x = toBit4(0);
      const y = toBit4(15);
      expect(gt(x, y).evaluate()).to.be.false;
    });

    it("should return false for equal numbers", () => {
      for (let i = 0; i < 16; i++) {
        const x = toBit4(i);
        const y = toBit4(i);
        expect(gt(x, y).evaluate()).to.be.false;
      }
    });
  });
});
