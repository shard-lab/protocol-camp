import { QAP } from "../src/qap";
import { R1CSSystem, Vector } from "../src/r1cs";
import { expect } from "chai";
import { bls12_381 } from "@noble/curves/bls12-381";
const Fp = bls12_381.fields.Fp; // (p ~ 2^381)

describe("QAP Tests", () => {
  it("should correctly convert R1CS to QAP and check polynomial construction", () => {
    // Create a simple R1CS system
    const r1csSystem = new R1CSSystem();

    // Add a constraint: a * b = c
    // For witness [1, a, b, c], this represents a * b = c
    const A = new Vector(0, 1, 0, 0); // extracts 'a'
    const B = new Vector(0, 0, 1, 0); // extracts 'b'
    const C = new Vector(0, 0, 0, 1); // extracts 'c'
    r1csSystem.addConstraint(A, B, C);

    // Convert to QAP
    const qap = QAP.fromR1CS(r1csSystem);

    // Verify the QAP structure
    expect(qap.u.length).to.equal(4); // Should have 4 variables (1, a, b, c)
    expect(qap.v.length).to.equal(4);
    expect(qap.w.length).to.equal(4);

    // Test the polynomials at r₁ = 1
    // r1 = 1 represents the point corresponding to the first constraint in the QAP.
    // In QAP, each R1CS constraint is mapped to a specific point (r₁, r₂, ...).
    // @Important: Here, r1 = 1 is the point at which we evaluate the first constraint "a * b = c".
    // The Lagrange polynomials are constructed to equal 1 at this point and 0 at all other constraint points.
    const r1 = 1n;

    // At point r₁, the polynomials should match the coefficients in the original constraint.
    // For our first constraint "a * b = c":
    expect(qap.u[1](r1)).to.equal(1n); // u₁(r₁) = 1 (coefficient of 'a')
    expect(qap.u[2](r1)).to.equal(0n); // u₂(r₁) = 0 (coefficient of 'b')
    expect(qap.v[1](r1)).to.equal(0n); // v₁(r₁) = 0 (coefficient of 'a')
    expect(qap.v[2](r1)).to.equal(1n); // v₂(r₁) = 1 (coefficient of 'b')
    expect(qap.w[3](r1)).to.equal(1n); // w₃(r₁) = 1 (coefficient of 'c')

    // Test the target polynomial
    expect(qap.t(r1)).to.equal(0n); // t(r₁) should be 0
  });

  it("should handle multiple constraints with Fraction precision", () => {
    const r1csSystem = new R1CSSystem();

    // (a + b) * (c + d) = out
    // witness = [1, a, b, c, d, a+b, c+d, out]

    // (a + b) * 1 = (a + b)
    // (c + d) * 1 = (c + d)
    // (a + b) * (c + d) = out

    r1csSystem.addConstraint(
      new Vector(0, 1, 1, 0, 0, 0, 0, 0), // a + b
      new Vector(1, 0, 0, 0, 0, 0, 0, 0), // 1
      new Vector(0, 0, 0, 0, 0, 1, 0, 0) // tmp1 (a + b)
    );

    r1csSystem.addConstraint(
      new Vector(0, 0, 0, 1, 1, 0, 0, 0), // c + d
      new Vector(1, 0, 0, 0, 0, 0, 0, 0), // 1
      new Vector(0, 0, 0, 0, 0, 0, 1, 0) // tmp2 (c + d)
    );

    r1csSystem.addConstraint(
      new Vector(0, 0, 0, 0, 0, 1, 0, 0), // tmp1
      new Vector(0, 0, 0, 0, 0, 0, 1, 0), // tmp2
      new Vector(0, 0, 0, 0, 0, 0, 0, 1) // out
    );

    const qap = QAP.fromR1CS(r1csSystem);

    // QAP transformation verification: u, v, w at r_j should match R1CS A, B, C
    for (let j = 0; j < r1csSystem.constraints.length; j++) {
      const r_j = BigInt(j + 1);
      const constraint = r1csSystem.constraints[j];
      for (let i = 0; i < constraint.A.length; i++) {
        expect(qap.u[i](r_j)).to.equal(BigInt(constraint.A[i]));
        expect(qap.v[i](r_j)).to.equal(BigInt(constraint.B[i]));
        expect(qap.w[i](r_j)).to.equal(BigInt(constraint.C[i]));
      }
    }

    // Target polynomial zero check
    expect(qap.t(1n)).to.equal(0n);
    expect(qap.t(2n)).to.equal(0n);
    expect(qap.t(3n)).to.equal(0n);

    // Calculate A(τ), B(τ), C(τ) after applying witness
    const tau = 6n;
    const { uEval, vEval, wEval, tEval } = qap.evaluateAt(tau);

    const witness = [1n, 2n, 3n, 5n, 7n, 5n, 12n, 60n];

    // Calculate A(τ) by summing the product of each witness element with its corresponding u polynomial evaluation
    const A_tau = witness.reduce((sum, wi, i) => Fp.add(sum, Fp.mul(wi, uEval[i])), 0n);
    // Calculate B(τ) by summing the product of each witness element with its corresponding v polynomial evaluation
    const B_tau = witness.reduce((sum, wi, i) => Fp.add(sum, Fp.mul(wi, vEval[i])), 0n);
    // Calculate C(τ) by summing the product of each witness element with its corresponding w polynomial evaluation
    const C_tau = witness.reduce((sum, wi, i) => Fp.add(sum, Fp.mul(wi, wEval[i])), 0n);

    // Calculate A(τ)*B(τ) - C(τ), which should be divisible by t(τ)
    const lhs = Fp.sub(Fp.mul(A_tau, B_tau), C_tau);
    // Calculate the inverse of t(τ)
    const tInv = Fp.inv(tEval);
    // Calculate h(τ) = (A(τ)*B(τ) - C(τ))/t(τ)
    const h_tau = Fp.mul(lhs, tInv);
    // Verify that h(τ)*t(τ) equals A(τ)*B(τ) - C(τ)
    const rhs = Fp.mul(h_tau, tEval);

    // This equality check confirms that A(τ)*B(τ) - C(τ) is indeed divisible by t(τ)
    expect(lhs).to.equal(rhs);
  });
});
