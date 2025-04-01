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

    // QAP 변환
    const qap = QAP.fromR1CS(r1csSystem);
    const crs = CRSSetup.generate(qap);
    const prover = new Prover(witness);
    const proof = prover.generateProof(qap, crs);
    const verifier = new Verifier();
    const bool = verifier.verify({
      A: proof.A,
      B: proof.B,
      C: proof.C,
      H: proof.H,
      T: crs.T,
    });

    expect(bool).to.be.true;
  });
});
