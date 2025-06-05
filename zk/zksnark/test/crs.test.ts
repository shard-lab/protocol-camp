import { expect } from "chai";
import { CRSSetup } from "../src/crs";
import { PointG1, PointG2 } from "@noble/bls12-381";
import { QAP } from "../src/qap";
import { R1CSSystem, Vector } from "../src/r1cs";

describe("CRS(Common Reference String) Tests", () => {
  describe("generate", () => {
    let qap: QAP;

    beforeEach(() => {
      // Create a simple R1CS system for testing
      const r1csSystem = new R1CSSystem();

      // Add a constraint: a * b = c
      const A = new Vector(0, 1, 0, 0); // extracts 'a'
      const B = new Vector(0, 0, 1, 0); // extracts 'b'
      const C = new Vector(0, 0, 0, 1); // extracts 'c'
      r1csSystem.addConstraint(A, B, C);

      // Convert to QAP
      qap = QAP.fromR1CS(r1csSystem);
    });

    it("should generate a CRS with correct structure and lengths", () => {
      const tau = 10n;
      const crs = CRSSetup.generate(qap, tau);

      // Check that the arrays have the correct length
      expect(crs.G1_u.length).to.equal(qap.u.length);
      expect(crs.G2_v.length).to.equal(qap.v.length);
      expect(crs.G1_w.length).to.equal(qap.w.length);
      expect(crs.G1_h.length).to.equal(Number(tau));
    });

    it("should include powers of tau in G1_h", () => {
      const crs = CRSSetup.generate(qap);

      // First element should be G1 * τ^0 = G1 * 1 = G1 (generator)
      expect(crs.G1_h[0].equals(PointG1.BASE)).to.be.true;

      // Other elements should be non-zero
      for (let i = 1; i < crs.G1_h.length; i++) {
        expect(crs.G1_h[i].equals(PointG1.ZERO)).to.be.false;
      }
    });
  });

  describe("CRS security properties", () => {
    it("should generate consistent CRS with known tau value", () => {
      // Create a simple QAP
      const r1csSystem = new R1CSSystem();
      const A = new Vector(0, 1, 0, 0);
      const B = new Vector(0, 0, 1, 0);
      const C = new Vector(0, 0, 0, 1);
      r1csSystem.addConstraint(A, B, C);
      const qap = QAP.fromR1CS(r1csSystem);

      // Generate a CRS with a known tau value
      const tau = 6n;
      const crs = CRSSetup.generate(qap, tau);

      // Verify the structure of G1_h points
      expect(crs.G1_h.length).to.equal(6);

      // Check basic structure of polynomial commitments
      expect(crs.G1_u.length).to.equal(4);
      expect(crs.G2_v.length).to.equal(4);
      expect(crs.G1_w.length).to.equal(4);

      // Check that first element is zero as expected
      expect(crs.G1_u[0].equals(PointG1.ZERO)).to.be.true;
    });
  });

  describe("CRS for proof verification", () => {
    it("should provide all necessary elements for verification", () => {
      // Create a simple QAP
      const r1csSystem = new R1CSSystem();
      const A = new Vector(0, 1, 0, 0);
      const B = new Vector(0, 0, 1, 0);
      const C = new Vector(0, 0, 0, 1);
      r1csSystem.addConstraint(A, B, C);
      const qap = QAP.fromR1CS(r1csSystem);

      const crs = CRSSetup.generate(qap);

      // Check that the target polynomial commitment is non-zero
      expect(crs.T.equals(PointG2.ZERO)).to.be.false;
    });
  });
});
