import { expect } from "chai";
import { Prover } from "../src/prover";
import { Verifier } from "../src/verifier";
import { CRSSetup } from "../src/crs";
import { QAP } from "../src/qap";
import { R1CSSystem, Vector } from "../src/r1cs";

describe("Prover Tests", () => {
  describe("generateProof", () => {
    it("should generate a valid proof for a simple constraint", async () => {
      // Create a simple R1CS system: a * b = c
      const r1csSystem = new R1CSSystem();
      const A = new Vector(0, 1, 0, 0); // extracts 'a'
      const B = new Vector(0, 0, 1, 0); // extracts 'b'
      const C = new Vector(0, 0, 0, 1); // extracts 'c'
      r1csSystem.addConstraint(A, B, C);

      // Convert to QAP
      const qap = QAP.fromR1CS(r1csSystem);

      // Generate CRS
      const tau = 4n; // Secret value for testing
      const crs = CRSSetup.generate(qap, tau);

      // Create a valid witness: [1, a=3, b=4, c=12]
      const witness = [1n, 3n, 4n, 12n];

      // Generate proof
      const prover = new Prover(witness);
      const proof = prover.generateProof(qap, crs);

      // Verify the proof
      const verifier = new Verifier();
      const isValid = await verifier.verify({
        A: proof.A,
        B: proof.B,
        C: proof.C,
        H: proof.H,
        T: crs.T,
      });

      expect(isValid).to.be.true;
    });

    it("should generate a valid proof for a complex circuit", async () => {
      // Create a more complex R1CS system: (a + b) * (c + d) = out
      // witness = [1, a, b, c, d, a+b, c+d, out]
      const r1csSystem = new R1CSSystem();

      // (a + b) * 1 = (a + b)
      r1csSystem.addConstraint(
        new Vector(0, 1, 1, 0, 0, 0, 0, 0), // a + b
        new Vector(1, 0, 0, 0, 0, 0, 0, 0), // 1
        new Vector(0, 0, 0, 0, 0, 1, 0, 0) // tmp1 (a + b)
      );

      // (c + d) * 1 = (c + d)
      r1csSystem.addConstraint(
        new Vector(0, 0, 0, 1, 1, 0, 0, 0), // c + d
        new Vector(1, 0, 0, 0, 0, 0, 0, 0), // 1
        new Vector(0, 0, 0, 0, 0, 0, 1, 0) // tmp2 (c + d)
      );

      // (a + b) * (c + d) = out
      r1csSystem.addConstraint(
        new Vector(0, 0, 0, 0, 0, 1, 0, 0), // tmp1
        new Vector(0, 0, 0, 0, 0, 0, 1, 0), // tmp2
        new Vector(0, 0, 0, 0, 0, 0, 0, 1) // out
      );

      // Convert to QAP
      const qap = QAP.fromR1CS(r1csSystem);

      // Generate CRS
      const crs = CRSSetup.generate(qap);

      // Create a valid witness: [1, a=2, b=3, c=5, d=7, a+b=5, c+d=12, out=60]
      const witness = [1n, 2n, 3n, 5n, 7n, 5n, 12n, 60n];

      // Generate proof
      const prover = new Prover(witness);
      const proof = prover.generateProof(qap, crs);

      // Verify the proof
      const verifier = new Verifier();
      const isValid = await verifier.verify({
        A: proof.A,
        B: proof.B,
        C: proof.C,
        H: proof.H,
        T: crs.T,
      });

      expect(isValid).to.be.true;
    });
  });
});
