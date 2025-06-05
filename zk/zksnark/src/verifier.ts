import { PointG1, PointG2, pairing, Fp12 } from "@noble/bls12-381";

/**
 * Structure representing a zk-SNARK proof
 * Contains the cryptographic commitments needed for verification
 */
export type Proof = {
  A: PointG1; // Commitment to polynomial A(x) in G1 group
  B: PointG2; // Commitment to polynomial B(x) in G2 group
  C: PointG1; // Commitment to polynomial C(x) in G1 group
  H: PointG1; // Commitment to quotient polynomial H(x) in G1 group
};

/**
 * Verifier class for zk-SNARK proofs
 * Implements the verification algorithm using bilinear pairings
 *
 * The key property of this verifier is that it can validate proofs without knowing:
 * - The secret value τ (tau) used in the trusted setup
 * - The actual witness values that satisfy the circuit
 *
 * This is the essence of zero-knowledge: verification happens purely through
 * operations on elliptic curve points that encode the necessary relationships.
 */
export class Verifier {
  /**
   * Verifies a zk-SNARK proof using pairing-based cryptography
   * The verification equation checks: e(A, B) == e(C, G2) * e(H, T)
   *
   * This verification works without knowing the witness or τ value,
   * demonstrating the power of homomorphic hiding and bilinear pairings.
   * The verifier only needs to perform operations on group elements (points)
   * that encode the necessary mathematical relationships.
   *
   * @param args - Object containing proof elements (A, B, C, H) and the target polynomial commitment T
   * @returns Promise<boolean> - True if the proof is valid, false otherwise
   */
  public verify(args: {
    A: PointG1; // Prover's commitment to A(x)
    B: PointG2; // Prover's commitment to B(x)
    C: PointG1; // Prover's commitment to C(x)
    H: PointG1; // Prover's commitment to H(x)
    T: PointG2; // CRS element: commitment to target polynomial t(x)
  }): boolean {
    const { A, B, C, H, T } = args;

    // Calculate the left-hand side of verification equation: e(A, B)
    const pairingAB: Fp12 = pairing(A, B);

    // Calculate first part of right-hand side: e(C, G2 generator)
    // G2.BASE is the generator point of the G2 group
    const pairingCG2: Fp12 = pairing(C, PointG2.BASE);

    // Calculate second part of right-hand side: e(H, T)
    const pairingHT = H.equals(PointG1.ZERO) ? Fp12.ONE : pairing(H, T);

    // Compute complete right-hand side: e(C, G2) * e(H, T)
    // This multiplication happens in the Fp12 field (target group of the pairing)
    const rhs = pairingCG2.multiply(pairingHT);

    // Verify if left-hand side equals right-hand side
    // This checks if the proof satisfies the verification equation
    return pairingAB.equals(rhs);
  }
}
