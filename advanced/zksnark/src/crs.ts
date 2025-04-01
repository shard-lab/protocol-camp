/**
 * Imports necessary cryptographic primitives and types from the BLS12-381 curve implementation
 * and the Quadratic Arithmetic Program (QAP) module
 */
import { PointG1, PointG2 } from "@noble/bls12-381";
import { QAP } from "./qap";
import { bls12_381 } from "@noble/curves/bls12-381";

// Field element operations in the BLS12-381 scalar field
const Fr = bls12_381.fields.Fr;

/**
 * Common Reference String (CRS) interface
 * Contains the structured reference string elements needed for zk-SNARK operations
 */
export interface CRS {
  readonly G1_u: PointG1[]; // G1^{u_i(τ)} - Commitments to u polynomials evaluated at τ
  readonly G2_v: PointG2[]; // G2^{v_i(τ)} - Commitments to v polynomials evaluated at τ
  readonly G1_w: PointG1[]; // G1^{w_i(τ)} - Commitments to w polynomials evaluated at τ
  readonly G1_h: PointG1[]; // G1^{τ^i} for H(x) commitment - Powers of τ for polynomial commitments
  readonly T: PointG2; // G2^{t(τ)} - Commitment to the target polynomial evaluated at τ
}

/**
 * CRSSetup class handles the generation of the Common Reference String
 * This is part of the trusted setup phase in zk-SNARKs
 */
export class CRSSetup {
  /**
   * Generates a Common Reference String from a Quadratic Arithmetic Program
   *
   * @param qap - The Quadratic Arithmetic Program representing the circuit
   * @param tau - Optional secret value for the trusted setup. If not provided, a random value will be generated
   * @returns A Common Reference String containing all necessary elements for proofs
   */
  static generate(qap: QAP, tau?: bigint): CRS {
    // Use provided tau if available, otherwise generate a random value
    const tauValue =
      tau ?? Fr.create(BigInt(Math.floor(Math.random() * (20 - qap.u.length)) + qap.u.length + 1));

    // Evaluate the target polynomial t(x) at τ and create a commitment in G2
    const tEval = Fr.create(qap.t(tauValue));
    const T = Fr.eql(tEval, Fr.ZERO) ? PointG2.ZERO : PointG2.BASE.multiply(tEval);

    // Create commitments to each u_i polynomial evaluated at τ in G1
    const G1_u: PointG1[] = qap.u.map((fn) => {
      const val = Fr.create(fn(tauValue));
      return Fr.eql(val, Fr.ZERO) ? PointG1.ZERO : PointG1.BASE.multiply(val);
    });

    // Create commitments to each v_i polynomial evaluated at τ in G2
    const G2_v: PointG2[] = qap.v.map((fn) => {
      const val = Fr.create(fn(tauValue));
      return Fr.eql(val, Fr.ZERO) ? PointG2.ZERO : PointG2.BASE.multiply(val);
    });

    // Create commitments to each w_i polynomial evaluated at τ in G1
    const G1_w: PointG1[] = qap.w.map((fn) => {
      const val = Fr.create(fn(tauValue));
      return Fr.eql(val, Fr.ZERO) ? PointG1.ZERO : PointG1.BASE.multiply(val);
    });

    // Create commitments to powers of τ in G1 for H(x) polynomial commitment
    const maxH = Number(tauValue);
    const G1_h: PointG1[] = Array.from({ length: maxH }, (_, i) => {
      const tauPower = tauValue ** BigInt(i);
      return tauPower === 0n ? PointG1.ZERO : PointG1.BASE.multiply(tauPower);
    });

    // Return the complete Common Reference String
    return {
      G1_u,
      G2_v,
      G1_w,
      G1_h,
      T,
    };
  }
}
