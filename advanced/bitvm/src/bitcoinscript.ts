import { Bitcommitment } from "./proof";
import { hash } from "./util";

/**
 * This module provides functions for creating Bitcoin Script operations
 * related to BitVM logic gates and bit commitments.
 *
 * Bitcoin Script is used to encode the logic of BitVM operations,
 * allowing for verification of logical operations on the Bitcoin blockchain.
 *
 * The functions in this module generate script templates that can be used
 * to verify the correct execution of logical operations like NAND gates.
 *
 * @important This is a simplified version of Bitcoin Script for demonstration purposes.
 * In a real implementation, this would need to be written in actual Bitcoin Script.
 *
 * The script below takes 3 preimages and:
 * 1. Uses BIT_COMMIT_OP to calculate whether each input is 0 or 1 by comparing the preimage to the hash of 0 and 1
 * 2. Performs A NAND B = C operation
 * 3. Verifies the result matches the expected output
 *
 * Note: The Verifier class contains a function that executes this simplified script.
 */

export function createNandGateCommitment(
  leftBit: Bitcommitment,
  rightBit: Bitcommitment,
  outBit: Bitcommitment
): string {
  return `
    ${hash(leftBit.preimage0)} 
    ${hash(leftBit.preimage1)} 
    BIT_COMMIT_OP 
    ${hash(rightBit.preimage0)} 
    ${hash(rightBit.preimage1)} 
    BIT_COMMIT_OP 
    ${hash(outBit.preimage0)}  
    ${hash(outBit.preimage1)} 
    NAND_OP 
    EQUAL_VERIFY
    `.trim();
}
