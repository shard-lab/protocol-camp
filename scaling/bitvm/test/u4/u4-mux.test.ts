import { expect } from "chai";
import { toBit4, mux } from "../../src/u4";
import { Leaf } from "../../src/gate";

describe("4-bit Multiplexer", () => {
  describe("mux", () => {
    it("should select first input when select is true", () => {
      const select = new Leaf(true);
      const a = toBit4(5); // 0101
      const b = toBit4(10); // 1010
      const result = mux(select, a, b);
      expect(result.map((x) => x.evaluate())).to.deep.equal([true, false, true, false]); // Should select 5 (0101)
    });

    it("should select second input when select is false", () => {
      const select = new Leaf(false);
      const a = toBit4(5); // 0101
      const b = toBit4(10); // 1010
      const result = mux(select, a, b);
      expect(result.map((x) => x.evaluate())).to.deep.equal([false, true, false, true]); // Should select 10 (1010)
    });

    it("should work with all zeros", () => {
      const select = new Leaf(true);
      const a = toBit4(0);
      const b = toBit4(0);
      const result = mux(select, a, b);
      expect(result.map((x) => x.evaluate())).to.deep.equal([false, false, false, false]);
    });

    it("should work with all ones", () => {
      const select = new Leaf(false);
      const a = toBit4(15);
      const b = toBit4(15);
      const result = mux(select, a, b);
      expect(result.map((x) => x.evaluate())).to.deep.equal([true, true, true, true]);
    });
  });
});
