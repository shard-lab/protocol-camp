import { R1CS, R1CSSystem, Vector } from "../src/r1cs";
import assert from "assert";

describe("R1CS Tests", () => {
  describe("Vector", () => {
    it("should correctly calculate the inner product of two vectors", () => {
      const vec1 = new Vector(1, 2, 3);
      const vec2 = new Vector(4, 5, 6);
      const result = vec1.innerProduct(vec2);
      assert.strictEqual(result, 1 * 4 + 2 * 5 + 3 * 6);
    });

    it("should return 0 for empty vectors", () => {
      const vec1 = new Vector();
      const vec2 = new Vector();
      const result = vec1.innerProduct(vec2);
      assert.strictEqual(result, 0);
    });
  });

  describe("R1CS", () => {
    it("should return true when the R1CS constraint is satisfied", () => {
      const A = new Vector(0, 1, 0, 0);
      const B = new Vector(0, 0, 1, 0);
      const C = new Vector(0, 0, 0, 1);
      const r1cs = new R1CS(A, B, C);

      // For witness [1, a, b, c], this constraint represents a * b = c
      // A·witness = 3 (extracts the second element 'a')
      // B·witness = 4 (extracts the third element 'b')
      // C·witness = 12 (extracts the fourth element 'c')
      // The constraint is satisfied when (A·witness) * (B·witness) = C·witness
      // In this case: 3 * 4 = 12, so this passes
      const witness = new Vector(1, 3, 4, 12);
      assert.strictEqual(r1cs.evaluate(witness), true);
    });

    it("should return false when the R1CS constraint is not satisfied", () => {
      const A = new Vector(0, 1, 0, 0);
      const B = new Vector(0, 0, 1, 0);
      const C = new Vector(0, 0, 0, 1);
      const r1cs = new R1CS(A, B, C);

      // For witness [1, a, b, c], this constraint represents a * b = c
      const witness = new Vector(1, 3, 4, 11); // 3 * 4 != 11
      assert.strictEqual(r1cs.evaluate(witness), false);
    });

    it("should handle more complex constraints", () => {
      // Constraint: (x + y) * (x - y) = x^2 - y^2
      // Let's say witness = [1, x, y, x^2, y^2, x^2-y^2]
      const A = new Vector(0, 1, 1, 0, 0, 0); // x + y
      const B = new Vector(0, 1, -1, 0, 0, 0); // x - y
      const C = new Vector(0, 0, 0, 0, 0, 1); // x^2 - y^2
      const r1cs = new R1CS(A, B, C);

      const witness = new Vector(1, 5, 3, 25, 9, 16); // x=5, y=3
      assert.strictEqual(r1cs.evaluate(witness), true);
    });
  });

  describe("R1CSSystem", () => {
    it("should evaluate a system with multiple constraints", () => {
      const r1csSystem = new R1CSSystem();

      // Represent: x*y*z
      // Witness: [1, x, y, z, x*y, y*z, x*y*z]

      // Constraint 1: x * y = x*y
      r1csSystem.addConstraint(
        new Vector(0, 1, 0, 0, 0, 0, 0), // x
        new Vector(0, 0, 1, 0, 0, 0, 0), // y
        new Vector(0, 0, 0, 0, 1, 0, 0) // x*y
      );

      // Constraint 2: y * z = y*z
      r1csSystem.addConstraint(
        new Vector(0, 0, 1, 0, 0, 0, 0), // y
        new Vector(0, 0, 0, 1, 0, 0, 0), // z
        new Vector(0, 0, 0, 0, 0, 1, 0) // y*z
      );

      // Constraint 3: (x*y) * z = x*y*z
      r1csSystem.addConstraint(
        new Vector(0, 0, 0, 0, 1, 0, 0), // x*y
        new Vector(0, 0, 0, 1, 0, 0, 0), // z
        new Vector(0, 0, 0, 0, 0, 0, 1) // x*y*z
      );

      // Valid witness for x=2, y=3, z=4
      const validWitness = new Vector(1, 2, 3, 4, 6, 12, 24);
      assert.strictEqual(r1csSystem.evaluate(validWitness), true);

      // Invalid witness (incorrect intermediate value)
      const invalidWitness = new Vector(1, 2, 3, 4, 7, 12, 24);
      assert.strictEqual(r1csSystem.evaluate(invalidWitness), false);
    });

    it("should evaluate a system representing a quadratic equation", () => {
      // Represent: y = x^2 + 2x + 3
      // We'll use witness = [1, x, y, x^2, 2x, x^2+2x+3]
      const r1csSystem = new R1CSSystem();

      // Constraint 1: x * x = x^2
      r1csSystem.addConstraint(
        new Vector(0, 1, 0, 0, 0, 0, 0), // x
        new Vector(0, 1, 0, 0, 0, 0, 0), // x
        new Vector(0, 0, 0, 1, 0, 0, 0) // x^2
      );

      // Constraint 2: (x^2 + 2x + 3) = y
      // This can be written as (x^2 + 2x + 3) * 1 = y
      r1csSystem.addConstraint(
        new Vector(3, 0, 0, 1, 1, 0, 0), // x^2 + 2x + 3
        new Vector(1, 0, 0, 0, 0, 0, 0), // 1
        new Vector(0, 0, 1, 0, 0, 0, 0) // y
      );

      // For x = 2, y should be 2^2 + 2*2 + 3 = 4 + 4 + 3 = 11
      const witness = new Vector(1, 2, 11, 4, 4, 8, 11);
      assert.strictEqual(r1csSystem.evaluate(witness), true);

      // Invalid witness
      const invalidWitness = new Vector(1, 2, 10, 4, 4, 8, 11);
      assert.strictEqual(r1csSystem.evaluate(invalidWitness), false);
    });
  });
});
