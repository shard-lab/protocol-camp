import { Address, Block, Transaction } from "./bitcoin";
import { sha256Hex } from "./bitcoin";

// https://btcinformation.org/en/glossary/outpoint
// The data structure used to refer to a particular transaction output,
// consisting of a 32-byte TXID and a 4-byte output index number (vout).
export type OutPoint = string;
export type Commit = string;

export enum Opcode {
  INSCRIBE = "OP_INSCRIBE",
  REVEAL = "OP_REVEAL",
}

/**
 * Creates an OutPoint string by combining a transaction ID and output index
 * @param txId - The 32-byte transaction ID
 * @param vOut - The output index number (vout)
 * @returns A string in the format "txId:vOut" that uniquely identifies a transaction output
 */
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
 * Represents an inscription in the Ordinals protocol
 * @property satID - The ordinal number of the Satoshi where this inscription is assigned
 * @property commit - Hash value stored during the Commit phase
 * @property content - Original data stored during Reveal phase (optional)
 */
export interface Inscription {
  satID: number; // The ordinal number of the Satoshi where this inscription is assigned
  commit: Commit; // Hash value stored during the Commit phase
  content?: string; // Original data stored during Reveal phase
}

/**
 * Manages tracking of individual satoshis in the Ordinals protocol.
 *
 * This class is separated from the inscription creation/reveal logic to:
 * 1. Focus solely on satoshi tracking functionality
 * 2. Reduce complexity by separating concerns
 * 3. Make the codebase more maintainable and testable
 *
 * The tracker maintains a UTXO set with satoshi ranges and handles:
 * - Tracking satoshi movements through transactions
 * - Managing satoshi range calculations
 * - Updating satoshi ownership as blocks are mined
 */
export class Ordinals {
  /**
   * Stores unspent transaction outputs (UTXOs) and their associated satoshi ranges.
   * Each UTXO is mapped to an array of SatRanges representing the satoshis it contains.
   */
  satoshis: Map<OutPoint, SatRange[]> = new Map();

  /**
   * Stores inscriptions created through the Ordinals protocol.
   * Maps a unique inscription ID to its corresponding inscription data.
   *
   * The map is updated in two phases:
   * 1. Commit phase: Creates a new inscription entry with commit hash and satoshi ID
   * 2. Reveal phase: Updates the inscription with the revealed content
   *
   * Note: Using inscription ID as key instead of commit hash since multiple
   * inscriptions could have the same content/commit hash
   */
  inscriptions: Map<number, Inscription> = new Map();

  /**
   * Tracks the last satoshi number assigned.
   * Used to assign sequential ordinal numbers to newly mined satoshis.
   *
   * This counter is incremented as new blocks are mined and satoshis are created.
   * For example:
   * - Block 1 mines 5 satoshis: lastSat = 5
   * - Block 2 mines 5 more: lastSat = 10
   *
   * @Important: This is used to maintain the ordinal numbering scheme where each
   * satoshi gets a unique, sequential number that stays with it forever.
   */
  lastSat: number = 0;

  /**
   * Analyzes a mined block and updates the UTXO set with SatRange tracking.
   * @param block - The mined block to analyze
   */
  observe(block: Block): void {
    block.txs.forEach((tx) => {
      this.observeSatoshi(tx);
      this.observeInscriptions(tx);
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
  private observeSatoshi(tx: Transaction): void {
    // Handle block reward (coinbase) transaction
    if (tx.inputs.length === 0) {
      tx.outputs.forEach((output, index) => {
        const outPoint = createOutPoint(tx.id, index);
        const start = this.getNextSatNumber(output.amount);
        const range: SatRange = { start, count: output.amount };
        this.satoshis.set(outPoint, [range]);
      });
      return;
    }

    const inputSatRanges: SatRange[] = [];
    tx.inputs.forEach((input: { txId: string; vOut: number }) => {
      const outPoint = createOutPoint(input.txId, input.vOut);
      const ranges = this.satoshis.get(outPoint);
      if (ranges) {
        this.satoshis.delete(outPoint);
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

      this.satoshis.set(outPoint, outputRanges);
    });
  }

  /**
   * For minting (coinbase) transactions, generates a new satoshi range starting from a global counter.
   * It returns the starting satoshi number for the given output amount and increments the counter.
   */
  private getNextSatNumber(amount: number): number {
    if (this.lastSat === undefined) {
      this.lastSat = 0;
    }
    const start = this.lastSat;
    this.lastSat += amount;
    return start;
  }

  /**
   * Inscription data is stored in the witness field of a Transaction.
   * While the actual structure is more complex, this example simplifies it with these assumptions:
   *
   * 1. The witness array only handles two patterns:
   *    - Commit Transaction: [OP_INSCRIBE, commit]
   *    - Reveal Transaction: [OP_REVEAL, content]
   *
   * 2. witness[0] contains the OP Code:
   *    - OP_INSCRIBE: Indicates a Commit Transaction
   *    - OP_REVEAL: Indicates a Reveal Transaction
   *
   * 3. witness[1] contains the actual data:
   *    - For Commit Transaction: the commit hash value
   *    - For Reveal Transaction: the original content data
   *
   * Only these two patterns are considered valid Ordinals protocol transactions
   * and will be processed accordingly.
   */

  private observeInscriptions(tx: Transaction): void {
    // Return if witness is empty or missing
    if (!tx.witness || tx.witness.length < 2) {
      return;
    }

    // opcode = OP_INSCRIBE or OP_REVEAL
    const opcode = tx.witness[0];

    // data = commit or content
    const data = tx.witness[1];
    if (opcode === Opcode.INSCRIBE) {
      this.commitInscription(tx, data);
    } else if (opcode === Opcode.REVEAL) {
      this.revealInscription(tx, data);
    }
  }

  /**
   * Processes a commit transaction to assign an inscription to a specific satoshi.
   * This function handles the initial phase of inscription where a commitment hash is created.
   *
   * The process:
   * 1. Validates the transaction has outputs
   * 2. Gets the satoshi ranges for the first output
   * 3. Assigns the inscription to the lowest ordinal number in the range
   * 4. Stores the commitment with the target satoshi ID
   *
   * @param tx - The commit transaction containing the inscription data
   * @param commitHash - The SHA-256 hash of the inscription content (commitment)
   */
  private commitInscription(tx: Transaction, commit: Commit): void {
    if (tx.outputs.length === 0) {
      return; // Cannot process transaction without outputs because it has no satoshis to assign
    }

    /*
     * @Important : In the Ordinals protocol, inscriptions are assigned to the first output (index 0)
     * This follows the standard behavior where inscriptions are bound to the first UTXO
     * We create an outpoint (txid:vout) to track this first output's satoshi ranges
     */
    const outpoint = createOutPoint(tx.id, 0); // vout=0 for inscription assignment
    const satRanges = this.satoshis.get(outpoint);

    if (!satRanges || satRanges.length === 0) {
      return; // Ignore if no satoshi ranges exist in UTXO
    }

    /*
     * @Important : In Ordinals protocol, typically a UTXO with 1 satoshi is created for inscription
     * However, if the first UTXO contains more than 1 satoshi,
     * the inscription is assigned to the first (lowest ordinal number) satoshi in the range
     */

    const targetSat = satRanges[0].start;
    this.inscriptions.set(targetSat, { satID: targetSat, commit: commit });
  }

  /**
   * Processes a reveal transaction to verify the existing commit and add the original data.
   * This function handles the second phase of inscription where the actual content is revealed.
   *
   * The process:
   * 1. Gets the satoshi ranges from the input transaction
   * 2. Finds the inscription using the satoshi ID from input
   * 3. Verifies the revealed content matches the commit hash
   * 4. Updates the inscription with the revealed content
   *
   * @param tx - The reveal transaction containing the inscription data
   * @param revealData - The original inscription data being revealed
   */
  private revealInscription(tx: Transaction, data: string): void {
    if (tx.inputs.length === 0) {
      return; // Cannot process reveal without inputs
    }

    // Get satoshi ranges from input transaction (commit tx)
    const inputOutPoint = createOutPoint(tx.id, 0);
    const inputSatRanges = this.satoshis.get(inputOutPoint);

    if (!inputSatRanges || inputSatRanges.length === 0) {
      return; // No satoshi ranges found in input
    }

    // Get the satoshi ID from the input which is the commit utxo
    const satID = inputSatRanges[0].start;
    const inscription = this.inscriptions.get(satID);

    if (!inscription) {
      return; // No inscription found for this satoshi
    }

    // Verify the revealed data matches the committed hash
    if (inscription.commit !== sha256Hex(data)) {
      return; // Data doesn't match commit hash
    }

    // Update the content for this inscription
    inscription.content = data;
    this.inscriptions.set(satID, inscription);
  }
}
