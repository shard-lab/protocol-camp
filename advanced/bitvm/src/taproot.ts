import { createNandGateCommitment } from "./bitcoinscript";
import { Proof } from "./proof";
import { hash } from "./util";

/**
 * Represents a Taproot structure for organizing NAND gate commitments in a Merkle tree.
 * This class builds a Merkle tree from NAND gate scripts and provides the root hash used in generation of Taproot address.
 */
export class Taproot {
  /** The Merkle root hash of all script leaves */
  public readonly hash: string;
  /** Array of leaf hashes in the Merkle tree */
  public readonly leaves: string[];
  /** Array of Bitcoin scripts representing NAND gate commitments */
  public readonly scripts: string[];

  /**
   * Creates a new Taproot structure from a proof tree
   * @param root The root node of the proof tree
   */
  constructor(root: Proof) {
    // Generate Bitcoin scripts for each NAND node in the proof tree
    this.scripts = this.collectNandNodes(root).map((node) => {
      if (!node.left || !node.right) {
        throw new Error("NAND node must have leftBit and rightBit");
      }
      return createNandGateCommitment(
        node.left.bitcommitment,
        node.right.bitcommitment,
        node.bitcommitment
      );
    });

    // Hash each script to create the leaf nodes of the Merkle tree
    this.leaves = this.scripts.map((script) => hash(script));
    // Compute the Merkle root hash
    this.hash = this.computeRoot();
  }

  /**
   * Collects all NAND nodes from the proof tree using depth-first search
   * @param root The root node of the proof tree
   * @returns Array of ProofNodes representing NAND gates
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

  /**
   * Computes the Merkle root hash from the leaf nodes
   * @returns The Merkle root hash as a hex string
   */
  private computeRoot(): string {
    // Handle empty tree case
    if (this.leaves.length === 0) {
      return "".padEnd(64, "0");
    }

    // Start with the leaf layer
    let layer = this.leaves;
    // Continue until we reach the root (a single hash)
    while (layer.length > 1) {
      const nextLayer: string[] = [];
      // Process pairs of nodes
      for (let i = 0; i < layer.length; i += 2) {
        if (i + 1 < layer.length) {
          // Hash the pair of nodes together
          nextLayer.push(hash(layer[i], layer[i + 1]));
        } else {
          // If there's an odd number of nodes, promote the last one
          nextLayer.push(layer[i]);
        }
      }
      layer = nextLayer;
    }
    // Return the root hash
    return layer[0];
  }
}
