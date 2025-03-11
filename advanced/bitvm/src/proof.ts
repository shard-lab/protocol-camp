import { LogicGate, NandNode } from "./gate";
import { hash, randomNonce } from "./util";

/**
 * Interface representing a bit commitment with preimages for verification
 * Contains the actual bit value and preimages for both 0 and 1 cases
 */
/**
 * Interface representing a bit commitment with preimages for verification.
 *
 * The bit value commitment is the most elementary component of the BitVM system.
 * It allows the prover to set the value of a particular bit to either "0" or "1"
 * across different Scripts and UTXOs. This enables extending Bitcoin's VM execution
 * runtime by splitting it across multiple transactions.
 *
 * Similar to Lamport signatures, the commitment contains two hashes (hash0 and hash1).
 * The prover later sets the bit's value by revealing either:
 * - preimage0 (the preimage of hash0) to set the bit to "0"
 * - preimage1 (the preimage of hash1) to set the bit to "1"
 */
export interface Bitcommitment {
  bit: boolean;
  preimage0: string;
  preimage1: string;
}

/**
 * Proof class that converts a LogicGate into a verifiable proof structure
 * Since LogicGate only contains pure logic operations, this class adds the proof elements
 * needed for verification by generating hash values and preimages to share with the Verifier
 */
export class Proof {
  id: number;
  bitcommitment: Bitcommitment;

  left?: Proof;
  right?: Proof;

  /**
   * Creates a proof structure from a logic gate
   * @param gate The logic gate to convert to a proof
   * @param id Unique identifier for this proof node
   */
  constructor(gate: LogicGate, id: number = 0) {
    this.id = id;

    // Evaluate the actual bit value from the logic gate
    const bit = gate.evaluate();

    // Generate hash commitments and preimages for verification
    this.bitcommitment = {
      bit,
      preimage0: hash(randomNonce()),
      preimage1: hash(randomNonce()),
    };

    // Recursively create proofs for NAND gate inputs
    if (gate instanceof NandNode) {
      this.left = new Proof(gate.left, id * 2 + 1);
      this.right = new Proof(gate.right, id * 2 + 2);
    }
  }
}
