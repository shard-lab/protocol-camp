import { expect } from "chai";
import { toBit4, fromBit4 } from "../../src/u4";

describe("4-bit Operations", () => {
  describe("toBit4", () => {
    it("should convert 0 to [0,0,0,0]", () => {
      const bits = toBit4(0);
      expect(bits[0].evaluate()).to.be.false;
      expect(bits[1].evaluate()).to.be.false;
      expect(bits[2].evaluate()).to.be.false;
      expect(bits[3].evaluate()).to.be.false;
    });

    it("should convert 15 to [1,1,1,1]", () => {
      const bits = toBit4(15);
      expect(bits[0].evaluate()).to.be.true;
      expect(bits[1].evaluate()).to.be.true;
      expect(bits[2].evaluate()).to.be.true;
      expect(bits[3].evaluate()).to.be.true;
    });

    it("should convert 10 to [0,1,0,1]", () => {
      const bits = toBit4(10);
      expect(bits[0].evaluate()).to.be.false; // LSB
      expect(bits[1].evaluate()).to.be.true;
      expect(bits[2].evaluate()).to.be.false;
      expect(bits[3].evaluate()).to.be.true; // MSB
    });
  });

  describe("fromBit4", () => {
    it("should convert [0,0,0,0] to 0", () => {
      const bits = toBit4(0);
      expect(fromBit4(bits)).to.equal(0);
    });

    it("should convert [1,1,1,1] to 15", () => {
      const bits = toBit4(15);
      expect(fromBit4(bits)).to.equal(15);
    });

    it("should convert [0,1,0,1] to 10", () => {
      const bits = toBit4(10);
      expect(fromBit4(bits)).to.equal(10);
    });

    it("should be reversible for all 4-bit numbers", () => {
      for (let i = 0; i < 16; i++) {
        const bits = toBit4(i);
        expect(fromBit4(bits)).to.equal(i);
      }
    });
  });
});
