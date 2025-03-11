import { describe, it } from "mocha";
import { Proof } from "../src/proof";
import { add, sub, toBit4, u4, isZero } from "../src/u4";
import { Prover, Verifier } from "../src/bitvm";
import { expect } from "chai";

describe("BitVM Protocol", function () {
  this.timeout(30000);

  it("demonstrates BitVM protocol for proving knowledge of x,y where x+y=7", () => {
    // Scenario: Prover knows values x=4, y=3 that satisfy x+y=7
    // They want to prove they know these values without revealing them
    // The circuit is converted to NAND gates that the verifier can check

    // Step 1: Create circuit that checks if (x + y == 7)
    // We use 4-bit integers (u4) to keep the circuit small for demonstration
    const circuit = (() => {
      // Prover knows x=4, y=3
      const x: u4 = toBit4(4); // 0100 in binary
      const y: u4 = toBit4(3); // 0011 in binary
      const target: u4 = toBit4(7); // 0111 in binary

      // Add x + y using NAND gates
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [sum, overflow] = add(x, y); // sum = 7 (0111)

      // Subtract target from sum to check equality
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [diff, borrow] = sub(sum, target); // diff = 0 if sum == target

      // Check if difference is zero (true if x + y == 7)
      return isZero(diff); // Returns true since 7 - 7 = 0
    })();

    // Step 2: Prover creates proof structure and commitments and gives it to the verifier
    const proof = new Proof(circuit);
    const prover = new Prover(proof);
    const verifier = new Verifier(prover.taproot);
    // Proof contains hash commitments for each NAND gate:
    // - Two preimages for each input (representing 0 and 1)
    // - Two preimages for the output
    // Example for one NAND gate where inputs are 1,1:
    //   input1: hash(preimage1_1) represents 1
    //   input2: hash(preimage2_1) represents 1
    //   output: hash(preimage_out_0) represents 0 (NAND(1,1) = 0)

    // Step 3-6: Verifier challenges random gates multiple times
    // This ensures prover isn't cheating by using inconsistent values
    for (let i = 0; i < 10; i++) {
      // Verifier randomly selects a gate to check
      const challenge = verifier.generateChallenge();

      // Prover reveals preimages for the challenged gate
      // For honest provers, these will be consistent across all challenges
      const { leftPreimage, rightPreimage, outputPreimage } = prover.challenge(challenge);

      // Verifier checks:
      // 1. Preimages hash to the committed values
      // 2. Output follows NAND logic for the inputs
      const isValid = verifier.verify(challenge, leftPreimage, rightPreimage, outputPreimage);

      // Verification passes for honest provers who:
      // - Used consistent values throughout the circuit
      // - Correctly implemented NAND logic
      // - Revealed matching preimages
      expect(isValid).to.be.true;

      // Note: Verification would fail if prover tried to cheat by:
      // - Using different values for same wire in different gates
      // - Example: Using preimage for 1 in one gate but preimage for 0
      //   in another gate for the same circuit wire
    }
  });
});
