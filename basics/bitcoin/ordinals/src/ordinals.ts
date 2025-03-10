import { Address, Block, Transaction } from "./bitcoin";

// https://btcinformation.org/en/glossary/outpoint
// The data structure used to refer to a particular transaction output,
// consisting of a 32-byte TXID and a 4-byte output index number (vout).
export type OutPoint = string;

export const createOutPoint = (txId: string, vOut: number): OutPoint => {
  return `${txId}:${vOut}`;
};

/**
 * Represents a range of satoshis
 * @property start - The starting satoshi index in the range (e.g. if start=10, it begins at satoshi #10)
 * @property count - The number of consecutive satoshis in the range (e.g. if count=5, it includes 5 satoshis)
 *
 * Example:
 * {
 *   start: 10,
 *   count: 5
 * }
 * This represents satoshis [10,11,12,13,14]
 *
 * The range format allows efficient storage and tracking of consecutive satoshi groups,
 * rather than storing each individual satoshi number.
 */
export interface SatRange {
  start: number;
  count: number;
}

/**
 * Manages ordinal tracking for Bitcoin satoshis.
 *
 * This class:
 * 1. Tracks individual satoshis as they move through transactions
 * 2. Maintains a UTXO set with satoshi range information
 * 3. Processes blocks to update satoshi ownership
 * 4. Handles satoshi range calculations for transaction inputs/outputs
 */
export class Ordinals {
  static utxos: Map<OutPoint, SatRange[]> = new Map();

  /**
   * Analyzes a mined block and updates the UTXO set with SatRange tracking.
   * @param block - The mined block to analyze
   */
  static observe(block: Block): void {
    block.txs.forEach((tx) => {
      this.processTx(tx);
    });
  }

  /**
   * Processes a single transaction, tracking satoshi ranges from inputs to outputs
   * @param tx - The transaction to process
   */
  /**
   * Processes a single transaction, tracking satoshi ranges from inputs to outputs.
   *
   * This method:
   * 1. Collects all satoshi ranges from the transaction inputs
   * 2. Removes spent UTXOs from the global UTXO set
   * 3. Distributes the collected satoshi ranges to the transaction outputs
   * 4. Creates new UTXO entries for each output with their assigned satoshi ranges
   * 5. Handles the case where a transaction is a coinbase (no inputs)
   *
   * @Important : All SatRanges from inputs are collected into a single array,
   * and then distributed to outputs using FIFO (First-In-First-Out) ordering.
   *
   * Examples:
   *
   * - Merging:
   *   Input1: [0-5] (5 sats)  ┐
   *                           ├──> Combined: [0-5, 10-15] ──> Output: [0-5, 10-15] (10 sats)
   *   Input2: [10-15] (5 sats)┘
   *
   * - Splitting:
   *   Input: [0-10] (10 sats) ──> Output1: [0-6] (6 sats)
   *                          └─> Output2: [7-9] (3 sats)
   *
   * - Burning:
   *   Input: [0-10] (10 sats) ──> Used: [0-5] ──> Output: [0-5] (5 sats)
   *                          └─> Remaining: [6-10] (destroyed in this function)
   *
   * @param tx - The transaction to process
   */
  private static processTx(tx: Transaction): void {
    const inputSatRanges: SatRange[] = [];
    tx.inputs.forEach((input: { txId: string; vOut: number }) => {
      const outPoint = createOutPoint(input.txId, input.vOut);
      const ranges = this.utxos.get(outPoint);

      if (ranges) {
        this.utxos.delete(outPoint);
        inputSatRanges.push(...ranges);
      }
    });

    let currentSatIndex = 0;
    tx.outputs.forEach((output: { address: Address; amount: number }, index: number) => {
      const outPoint = createOutPoint(tx.id, index);
      const outputRanges: SatRange[] = [];
      let remaining = output.amount;

      while (remaining > 0 && currentSatIndex < inputSatRanges.length) {
        const inputRange = inputSatRanges[currentSatIndex];
        const assignAmount = Math.min(remaining, inputRange.count);

        outputRanges.push({
          start: inputRange.start,
          count: assignAmount,
        });

        remaining -= assignAmount;
        inputRange.count -= assignAmount;
        inputRange.start += assignAmount;

        if (inputRange.count === 0) {
          currentSatIndex++;
        }
      }

      this.utxos.set(outPoint, outputRanges);
    });
  }
}
