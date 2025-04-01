import { PointG1, PointG2 } from "@noble/bls12-381";
import { bls12_381 } from "@noble/curves/bls12-381";
import { QAP } from "./qap";
import { CRS } from "./crs";
import { Proof } from "./verifier";

// Field element operations in the BLS12-381 scalar field
const Fr = bls12_381.fields.Fr;

/**
 * Represents a polynomial with coefficients in the scalar field Fr
 * The coefficients are stored in ascending order of degree:
 * coefficients[i] corresponds to the coefficient of x^i
 */
class Poly {
  public coefficients: bigint[];

  /**
   * Creates a new polynomial
   * @param coefficients - Array of coefficients in ascending order of degree
   * Default is [0n] representing the constant polynomial 0
   */
  constructor(coefficients: bigint[] = [0n]) {
    this.coefficients = coefficients;
  }

  /**
   * Performs Lagrange interpolation to find a polynomial that passes through all given points
   * @param points - Array of {x, y} coordinates in the field Fr
   * @returns A polynomial that passes through all the given points
   */
  static lagrangeInterpolation(points: { x: bigint; y: bigint }[]): Poly {
    const n = points.length;
    let poly = new Poly([0n]);
    for (let i = 0; i < n; i++) {
      // For each point, compute the Lagrange basis polynomial
      let numeratorPoly = new Poly([1n]);
      let denominator = Fr.ONE;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        // Build the term (x - x_j)
        const factor = new Poly([Fr.neg(points[j].x), 1n]);
        numeratorPoly = numeratorPoly.mul(factor);
        // Compute the denominator (x_i - x_j)
        denominator = Fr.mul(denominator, Fr.sub(points[i].x, points[j].x));
      }
      // Scale the basis polynomial by y_i / denominator
      const invDenom = Fr.inv(denominator);
      const scaled = numeratorPoly.scale(Fr.mul(points[i].y, invDenom));
      poly = poly.add(scaled);
    }
    return poly;
  }

  /**
   * Adds another polynomial to this one
   * @param other - The polynomial to add
   * @returns A new polynomial representing the sum
   */
  add(other: Poly): Poly {
    const n = Math.max(this.coefficients.length, other.coefficients.length);
    const res: bigint[] = [];
    for (let i = 0; i < n; i++) {
      const a = i < this.coefficients.length ? this.coefficients[i] : 0n;
      const b = i < other.coefficients.length ? other.coefficients[i] : 0n;
      res.push(Fr.add(a, b));
    }
    return new Poly(res);
  }

  /**
   * Multiplies this polynomial by another
   * @param other - The polynomial to multiply by
   * @returns A new polynomial representing the product
   */
  mul(other: Poly): Poly {
    const res: bigint[] = Array(this.coefficients.length + other.coefficients.length - 1).fill(0n);
    for (let i = 0; i < this.coefficients.length; i++) {
      for (let j = 0; j < other.coefficients.length; j++) {
        const idx = i + j;
        res[idx] = Fr.add(res[idx], Fr.mul(this.coefficients[i], other.coefficients[j]));
      }
    }
    return new Poly(res);
  }

  /**
   * Scales this polynomial by a scalar
   * @param scalar - The scalar to multiply by
   * @returns A new polynomial with all coefficients multiplied by the scalar
   */
  scale(scalar: bigint): Poly {
    return new Poly(this.coefficients.map((coef) => Fr.mul(coef, scalar)));
  }
}

/**
 * The Prover class generates zero-knowledge proofs for a given witness
 * using the Quadratic Arithmetic Program (QAP) and Common Reference String (CRS)
 */
export class Prover {
  private witness: bigint[];

  /**
   * Creates a new prover with the given witness
   * @param witness - The witness vector (solution to the circuit)
   */
  constructor(witness: bigint[]) {
    this.witness = witness;
  }

  /**
   * Generates a zero-knowledge proof for the witness
   * @param qap - The Quadratic Arithmetic Program representing the circuit
   * @param crs - The Common Reference String containing the trusted setup parameters
   * @returns A proof consisting of the commitments A, B, C, and H
   */
  public generateProof(qap: QAP, crs: CRS): Proof {
    // 1) Create commitments A, B, C
    // Compute A = Σ w_i * G1_u[i] - Commitment to witness using u polynomials in G1
    const A = this.witness.reduce(
      (acc, w, i) => (w === 0n ? acc : acc.add(crs.G1_u[i].multiply(Fr.create(w)))),
      PointG1.ZERO
    );

    // Compute B = Σ w_i * G2_v[i] - Commitment to witness using v polynomials in G2
    const B = this.witness.reduce(
      (acc, w, i) => (w === 0n ? acc : acc.add(crs.G2_v[i].multiply(Fr.create(w)))),
      PointG2.ZERO
    );
    // Compute C = Σ w_i * G1_w[i] - Commitment to witness using w polynomials in G1
    const C = this.witness.reduce(
      (acc, w, i) => (w === 0n ? acc : acc.add(crs.G1_w[i].multiply(Fr.create(w)))),
      PointG1.ZERO
    );

    // 2) Define polynomial functions A(x), B(x), C(x) for field evaluation
    // A(x) = Σ w_i * u_i(x) - Evaluates the A polynomial at point x
    const A_poly = (x: bigint) =>
      this.witness.reduce((acc, w, i) => {
        const wFr = Fr.create(w);
        const uFr = Fr.create(qap.u[i](x));
        return Fr.add(acc, Fr.mul(wFr, uFr));
      }, Fr.ZERO);

    // B(x) = Σ w_i * v_i(x) - Evaluates the B polynomial at point x
    const B_poly = (x: bigint) =>
      this.witness.reduce((acc, w, i) => {
        const wFr = Fr.create(w);
        const vFr = Fr.create(qap.v[i](x));
        return Fr.add(acc, Fr.mul(wFr, vFr));
      }, Fr.ZERO);

    // C(x) = Σ w_i * w_i(x) - Evaluates the C polynomial at point x
    const C_poly = (x: bigint) =>
      this.witness.reduce((acc, w, i) => {
        const wFr = Fr.create(w);
        const wFnFr = Fr.create(qap.w[i](x));
        return Fr.add(acc, Fr.mul(wFr, wFnFr));
      }, Fr.ZERO);

    // 3) Sample points to interpolate H(x) = (A(x)*B(x) - C(x)) / T(x)
    const samplePoints: { x: bigint; y: bigint }[] = [];
    for (let i = 0; i <= crs.G1_h.length - 1; i++) {
      const X = BigInt(i + 1);

      // Evaluate A(X), B(X), C(X), and T(X)
      const aEval = A_poly(X);
      const bEval = B_poly(X);
      const cEval = C_poly(X);
      const tEval = Fr.create(qap.t(X));

      // Calculate H(X) = (A(X)*B(X) - C(X)) / T(X)
      const numerator = Fr.sub(Fr.mul(aEval, bEval), cEval);
      const hEval = Fr.eql(tEval, Fr.ZERO) ? Fr.ZERO : Fr.div(numerator, tEval);

      // Store the point for interpolation
      samplePoints.push({ x: X, y: hEval });
    }

    // 4) Interpolate H(x) polynomial from sample points
    const hCoeffs = Poly.lagrangeInterpolation(samplePoints);

    // 5) Create H commitment: H = Σ h_i * G1_h[i]
    // This commits to the H polynomial using the powers of tau in the CRS
    const H_commit = hCoeffs.coefficients.reduce((acc, coeff, i) => {
      if (Fr.eql(coeff, Fr.ZERO)) return acc;
      return acc.add(crs.G1_h[i].multiply(Fr.create(coeff)));
    }, PointG1.ZERO);

    // Return the complete proof
    return { A, B, C, H: H_commit };
  }
}
