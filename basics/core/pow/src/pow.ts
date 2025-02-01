import { createHash } from "crypto";

/**
 * Function to perform proof of work.
 * @param data - The input data for the proof of work.
 * @param difficulty - The number of leading zero bits the hash must have. It should be between 0 and 256.
 *
 * @returns The nonce value that satisfies the proof of work condition.
 */
export function proofOfWork(data: string, difficulty: number): number {
  throw new Error("implement me!");
}
