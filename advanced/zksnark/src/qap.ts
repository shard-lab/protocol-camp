/**
 * Imports the R1CS system for constraint representation
 * and the BLS12-381 curve implementation for finite field operations
 */
import { R1CSSystem } from "./r1cs";
import { bls12_381 } from "@noble/curves/bls12-381";
const Fr = bls12_381.fields.Fr; // Field elements in the BLS12-381 scalar field (p ~ 2^381)

/**
 * Quadratic Arithmetic Program (QAP) representation of an R1CS constraint system
 * QAP transforms R1CS constraints into polynomial form for use in zk-SNARKs
 */
export class QAP {
  /**
   * Array of polynomial functions for the left input wires (corresponds to matrix A in R1CS)
   * Each function maps a point x to a field element
   */
  u: Array<(x: bigint) => bigint>;

  /**
   * Array of polynomial functions for the right input wires (corresponds to matrix B in R1CS)
   * Each function maps a point x to a field element
   */
  v: Array<(x: bigint) => bigint>;

  /**
   * Array of polynomial functions for the output wires (corresponds to matrix C in R1CS)
   * Each function maps a point x to a field element
   */
  w: Array<(x: bigint) => bigint>;

  /**
   * The target polynomial t(x) that has roots at all constraint evaluation points
   * This polynomial is used to check if A(x)·B(x) - C(x) is divisible by t(x)
   */
  t: (x: bigint) => bigint;

  /**
   * Creates a new QAP instance
   * @param u - Array of polynomial functions for left inputs
   * @param v - Array of polynomial functions for right inputs
   * @param w - Array of polynomial functions for outputs
   * @param t - Target polynomial function
   */
  constructor(
    u: Array<(x: bigint) => bigint>,
    v: Array<(x: bigint) => bigint>,
    w: Array<(x: bigint) => bigint>,
    t: (x: bigint) => bigint
  ) {
    this.u = u;
    this.v = v;
    this.w = w;
    this.t = t;
  }

  /**
   * QAP (Quadratic Arithmetic Program) is a way to represent R1CS constraints as polynomials.
   *
   * For each R1CS constraint matrix A, B, C, we convert them into sets of polynomials:
   *
   * If we have a constraint system with 3 constraints and 3 variables, the matrices would look like:
   * A = [
   *  [a₁₁, a₁₂, a₁₃],
   *  [a₂₁, a₂₂, a₂₃],
   *  [a₃₁, a₃₂, a₃₃],
   * ]
   *
   * B = [
   *  [b₁₁, b₁₂, b₁₃],
   *  [b₂₁, b₂₂, b₂₃],
   *  [b₃₁, b₃₂, b₃₃],
   * ]
   *
   * C = [
   *  [c₁₁, c₁₂, c₁₃],
   *  [c₂₁, c₂₂, c₂₃],
   *  [c₃₁, c₃₂, c₃₃],
   * ]
   *
   * We convert these into polynomials where each variable gets its own polynomial:
   * u₁(x) = a₁₁·L₁(x) + a₂₁·L₂(x) + a₃₁·L₃(x)
   * u₂(x) = a₁₂·L₁(x) + a₂₂·L₂(x) + a₃₂·L₃(x)
   * u₃(x) = a₁₃·L₁(x) + a₂₃·L₂(x) + a₃₃·L₃(x)
   *
   * v₁(x) = b₁₁·L₁(x) + b₂₁·L₂(x) + b₃₁·L₃(x)
   * v₂(x) = b₁₂·L₁(x) + b₂₂·L₂(x) + b₃₂·L₃(x)
   * v₃(x) = b₁₃·L₁(x) + b₂₃·L₂(x) + b₃₃·L₃(x)
   *
   * w₁(x) = c₁₁·L₁(x) + c₂₁·L₂(x) + c₃₁·L₃(x)
   * w₂(x) = c₁₂·L₁(x) + c₂₂·L₂(x) + c₃₂·L₃(x)
   * w₃(x) = c₁₃·L₁(x) + c₂₃·L₂(x) + c₃₃·L₃(x)
   *
   * This transformation allows us to represent the vector constraints as single polynomial equations,
   * which is essential for creating zero-knowledge proofs.
   *
   * How QAP is used in zero-knowledge proofs:
   *
   * 1. Witness Encoding: For a witness vector w = [w₁, w₂, ..., wₙ], we compute:
   *    - A(x) = Σ wᵢ·uᵢ(x)
   *    - B(x) = Σ wᵢ·vᵢ(x)
   *    - C(x) = Σ wᵢ·wᵢ(x)
   *
   * 2. Verification: The key property is that A(x)·B(x) - C(x) = H(x)·t(x)
   *    where t(x) is our target polynomial that equals 0 at all constraint points.
   *    This means A(x)·B(x) - C(x) must be divisible by t(x).
   *
   * 3. In a zk-SNARK:
   *    - The prover computes these polynomials and H(x)
   *    - The verifier checks the divisibility property at a random point τ
   *    - This allows verification without revealing the witness values
   *
   * 4. The QAP structure enables efficient verification through pairing-based cryptography,
   *    allowing the verifier to check the constraint satisfaction without learning the actual values.
   *
   * Note: Here x represents a point in the range from 1 to the number of constraints.
   * @Important a specific value of x corresponds to selecting a specific constraint in the system.
   * For example, when x = 1, we're evaluating the first constraint, when x = 2, the second constraint, and so on.
   * This is why our target polynomial t(x) has roots at these points (1 to n), representing each constraint.
   */
  static fromR1CS(r1csSystem: R1CSSystem): QAP {
    const constraints = r1csSystem.constraints;
    const numConstraints = constraints.length;
    // Create points for each constraint (1, 2, ..., numConstraints)
    const rPoints = Array.from({ length: numConstraints }, (_, i) => BigInt(i + 1));

    /**
     * Computes the Lagrange basis polynomial L_i(x) for a given index i
     * L_i(x) equals 1 when x = rPoints[i] and 0 when x = rPoints[j] for j ≠ i
     * @param i - The index of the basis polynomial
     * @param x - The point at which to evaluate the polynomial
     * @returns The value of the Lagrange basis polynomial at x
     */
    function lagrangeBasis(i: number, x: bigint): bigint {
      let result = Fr.ONE;
      for (let j = 0; j < rPoints.length; j++) {
        if (j === i) continue;
        const numerator = Fr.sub(x, rPoints[j]);
        const denominator = Fr.sub(rPoints[i], rPoints[j]);
        const invDen = Fr.inv(denominator);
        const frac = Fr.mul(numerator, invDen);
        result = Fr.mul(result, frac);
      }
      return result;
    }

    const variableCount = constraints[0].A.length;

    /**
     * Create the u polynomials (corresponding to matrix A in R1CS)
     * Each u_i(x) is a linear combination of Lagrange basis polynomials
     */
    const u: Array<(x: bigint) => bigint> = Array.from({ length: variableCount }, (_, varIdx) => {
      return (x: bigint): bigint => {
        return Array.from({ length: numConstraints }, (_, i) => {
          const coeff = constraints[i].A[varIdx];
          const Li = lagrangeBasis(i, x);
          return Fr.mul(BigInt(coeff), Li);
        }).reduce((sum, term) => Fr.add(sum, term), Fr.ZERO);
      };
    });

    /**
     * Create the v polynomials (corresponding to matrix B in R1CS)
     * Each v_i(x) is a linear combination of Lagrange basis polynomials
     */
    const v: Array<(x: bigint) => bigint> = Array.from({ length: variableCount }, (_, varIdx) => {
      return (x: bigint): bigint => {
        return Array.from({ length: numConstraints }, (_, i) => {
          const coeff = constraints[i].B[varIdx];
          const Li = lagrangeBasis(i, x);
          return Fr.mul(BigInt(coeff), Li);
        }).reduce((sum, term) => Fr.add(sum, term), Fr.ZERO);
      };
    });

    /**
     * Create the w polynomials (corresponding to matrix C in R1CS)
     * Each w_i(x) is a linear combination of Lagrange basis polynomials
     */
    const w: Array<(x: bigint) => bigint> = Array.from({ length: variableCount }, (_, varIdx) => {
      return (x: bigint): bigint => {
        return Array.from({ length: numConstraints }, (_, i) => {
          const coeff = constraints[i].C[varIdx];
          const Li = lagrangeBasis(i, x);
          return Fr.mul(BigInt(coeff), Li);
        }).reduce((sum, term) => Fr.add(sum, term), Fr.ZERO);
      };
    });

    /**
     * Create the target polynomial t(x) = ∏ (x - r_i)
     * This polynomial has roots at all constraint points
     * @param x - The point at which to evaluate t(x)
     * @returns The value of t(x) at the given point
     */
    function t(x: bigint): bigint {
      let prod = Fr.ONE;
      for (let i = 0; i < rPoints.length; i++) {
        const diff = Fr.sub(x, rPoints[i]);
        prod = Fr.mul(prod, diff);
      }
      return prod;
    }

    return new QAP(u, v, w, t);
  }

  /**
   * Evaluate the QAP at a specific point τ.
   * @param tau - The point (in Fr) at which to evaluate the QAP.
   * @returns An object containing the evaluations of u, v, w, and t at τ as BigInt arrays.
   */
  evaluateAt(tau: bigint) {
    // Evaluate each u_i polynomial at tau
    const uEval = this.u.map((f) => f(tau));
    // Evaluate each v_i polynomial at tau
    const vEval = this.v.map((f) => f(tau));
    // Evaluate each w_i polynomial at tau
    const wEval = this.w.map((f) => f(tau));
    // Evaluate the target polynomial at tau
    const tEval = this.t(tau);
    return { uEval, vEval, wEval, tEval };
  }
}
