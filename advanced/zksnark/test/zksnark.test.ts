import { QAP } from "../src/qap";
import { R1CSSystem, Vector } from "../src/r1cs";
import { Verifier } from "../src/verifier";
import { CRSSetup } from "../src/crs";
import { expect } from "chai";
import { Prover } from "../src/prover";

describe("R1CS Tests", () => {
  it("should correctly verify zk-SNARK proof", async () => {
    const r1csSystem = new R1CSSystem();

    // Represent: x * y * z
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

    // Example witness: [1, 3, 4, 12, 12, 48, 576]
    const witness = [1n, 3n, 4n, 12n, 12n, 48n, 144n]; // Fixed: x*y*z = 3*4*12 = 144

    // 1. Convert R1CS to QAP (Quadratic Arithmetic Program)
    // Transform each R1CS constraint into polynomial form to create the QAP
    // This conversion allows us to work with polynomials instead of linear constraints
    const qap = QAP.fromR1CS(r1csSystem);

    // 2. Generate Trusted Setup
    // Create Common Reference String (CRS) for the QAP
    // CRS contains cryptographic parameters needed for both proving and verification
    // This step typically requires a trusted third party in practice
    const crs = CRSSetup.generate(qap);

    // 3. Create Prover and Generate Proof
    // Initialize prover with the witness values
    // Generate zero-knowledge proof using QAP and CRS
    // The proof contains commitments A, B, C, and H that hide the actual witness
    const prover = new Prover(witness);
    const proof = prover.generateProof(qap, crs);

    // 4. Create Verifier and Verify Proof
    // Verify the generated proof is valid
    // Uses pairing-based cryptography to check relationships between proof elements
    // Importantly, verification happens without knowing the original witness values
    const verifier = new Verifier();
    const bool = verifier.verify({
      A: proof.A,
      B: proof.B,
      C: proof.C,
      H: proof.H,
      T: crs.T,
    });

  });
});
