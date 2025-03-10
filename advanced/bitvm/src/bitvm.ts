import { Proof } from "./proof";
import { Taproot } from "./taproot";
import { hash } from "./util";

/**
 * Represents a prover in the BitVM protocol who creates and reveals circuit commitments
 */
export class Prover {
  public proof: Proof;
  public taproot: Taproot;

  /**
   * Creates a new Prover with a circuit proof
   * @param proof The binary circuit proof
   */
  constructor(proof: Proof) {
    this.proof = proof;
    this.taproot = new Taproot(proof);
  }

  /**
   * Reveals preimages for a specific gate when challenged by the verifier
   * @param gateIndex The index of the gate to reveal
   * @returns The preimages needed to verify the gate
   */
  public challenge(gateIndex: number): {
    leftPreimage: string;
    rightPreimage: string;
    outputPreimage: string;
  } {
    if (gateIndex < 0 || gateIndex >= this.taproot.scripts.length) {
      throw new Error("Invalid gate index");
    }

    // Find the corresponding proof node
    const nodes = this.collectNandNodes(this.proof);
    const node = nodes[gateIndex];

    if (!node.left || !node.right) {
      throw new Error("Invalid NAND node");
    }

    // Determine which preimage to reveal based on the bit value
    const leftPreimage = node.left.bitcommitment.bit
      ? node.left.bitcommitment.preimage1
      : node.left.bitcommitment.preimage0;

    const rightPreimage = node.right.bitcommitment.bit
      ? node.right.bitcommitment.preimage1
      : node.right.bitcommitment.preimage0;

    const outputPreimage = node.bitcommitment.bit
      ? node.bitcommitment.preimage1
      : node.bitcommitment.preimage0;

    return {
      leftPreimage,
      rightPreimage,
      outputPreimage,
    };
  }

  /**
   * Collects all NAND nodes from the proof tree
   * @param root The root node of the proof tree
   * @returns Array of Proof nodes representing NAND gates
   */
  private collectNandNodes(root: Proof): Proof[] {
    const nodes: Proof[] = [];
    const dfs = (node: Proof) => {
      if (node.left && node.right) {
        nodes.push(node);
        dfs(node.left);
        dfs(node.right);
      }
    };
    dfs(root);
    return nodes;
  }
}

/**
 * Represents a verifier in the BitVM protocol who challenges and verifies circuit commitments
 */
export class Verifier {
  private taproot: Taproot;

  /**
   * Creates a new Verifier with a taproot commitment
   * @param taproot The taproot commitment from the prover
   */
  constructor(taproot: Taproot) {
    this.taproot = taproot;
  }

  /**
   * Generates a random gate index to challenge the prover
   * @returns The index of the gate to challenge
   */
  public generateChallenge(): number {
    const gateIndex = Math.floor(Math.random() * this.taproot.scripts.length);
    if (gateIndex < 0 || gateIndex >= this.taproot.scripts.length) {
      throw new Error("Invalid gate index");
    }
    return gateIndex;
  }

  /**
   * Verifies a gate using the provided preimages
   * @param gateIndex The index of the gate to verify
   * @param leftPreimage The preimage for the left input bit
   * @param rightPreimage The preimage for the right input bit
   * @param outputPreimage The preimage for the output bit
   * @returns True if the gate verification passes, false otherwise
   */
  public verify(
    gateIndex: number,
    leftPreimage: string,
    rightPreimage: string,
    outputPreimage: string
  ): boolean {
    if (gateIndex < 0 || gateIndex >= this.taproot.scripts.length) {
      throw new Error("Invalid gate index");
    }

    const script = this.taproot.scripts[gateIndex];

    // Extract the hash commitments from the script
    const hashCommitments = script.split(/\s+/);

    // Note: While the script in bitcoinscript.ts is designed to be executed on-chain,
    // here we perform the verification off-chain for demonstration purposes.
    // The script contains all necessary values for verification, so we extract and verify them:
    const leftHash0 = hashCommitments[0];
    const leftHash1 = hashCommitments[1];
    const rightHash0 = hashCommitments[3];
    const rightHash1 = hashCommitments[4];
    const outputHash0 = hashCommitments[6];
    const outputHash1 = hashCommitments[7];

    // Determine the bit values based on which preimage hashes match
    const leftBit = hash(leftPreimage) === leftHash1;
    const rightBit = hash(rightPreimage) === rightHash1;
    const outputBit = hash(outputPreimage) === outputHash1;

    // Verify that the preimages hash to the correct commitments
    const leftPreimageValid = hash(leftPreimage) === (leftBit ? leftHash1 : leftHash0);
    const rightPreimageValid = hash(rightPreimage) === (rightBit ? rightHash1 : rightHash0);
    const outputPreimageValid = hash(outputPreimage) === (outputBit ? outputHash1 : outputHash0);

    if (!leftPreimageValid || !rightPreimageValid || !outputPreimageValid) {
      return false;
    }

    // Verify the NAND logic: A NAND B = !(A && B)
    const expectedOutput = !(leftBit && rightBit);
    return expectedOutput === outputBit;
  }
}
