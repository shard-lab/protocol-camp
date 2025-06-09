import { Transaction, Address, sha256Hex, Bitcoin } from "./bitcoin";
import { Opcode } from "./ordinals";

export class TransactionBuilder {
  private bitcoin: Bitcoin;

  constructor(bitcoin: Bitcoin) {
    this.bitcoin = bitcoin;
  }

  /**
   * Creates a commit transaction for inscribing content in the Ordinals protocol.
   * The commit transaction stores a hash of the content that will be revealed later.
   *
   * @param params.spender - The address that owns the input UTXO and will own the inscription
   * @param params.inputTxId - Transaction ID of the input UTXO
   * @param params.inputVOut - Output index of the input UTXO
   * @param params.content - The content to be inscribed (will be hashed)
   * @returns The commit transaction
   */
  createCommitTransaction(params: {
    spender: Address;
    txId: string;
    vOut: number;
    content: string;
  }): Transaction {
    // TODO: Implement the commit transaction creation logic

    // Step 1: Validate the input transaction and output
    // - Check if transaction exists and get the output
    // - Verify the spender owns the output

    // Step 2: Create the commitment
    // - Hash the content using sha256Hex to create a secure commitment
    // - Set up witness data array containing:
    //   1. Opcode.INSCRIBE as first element
    //   2. Content hash as second element
    //   - Example: [Opcode.INSCRIBE, contentHash]

    // Step 3: Build commit transaction
    // - Create transaction spending the input UTXO
    // - Set output to same owner and amount
    // - Include witness data with commitment

    throw new Error("Not implemented");
  }

  /**
   * Creates a reveal transaction that reveals the original content matching a previous commit.
   * The reveal transaction verifies the content matches the committed hash and stores the content.
   *
   * @param params.spender - The address that owns the commit UTXO
   * @param params.commitTxId - Transaction ID of the commit transaction
   * @param params.commitVOut - Output index from commit transaction (should be 0)
   * @param params.content - The original content being revealed
   * @returns The reveal transaction
   */
  createRevealTransaction(params: {
    spender: Address;
    txId: string;
    vOut: number;
    content: string;
  }): Transaction {
    // TODO: Implement the reveal transaction creation logic

    // Step 1: Validate the commit transaction and output
    // - Check if commit transaction exists and get the output
    // - Verify the spender owns the output
    // - Get and verify the commitment from witness data

    // Step 2: Verify the content
    // - Hash the revealed content
    // - Verify it matches the original commitment

    // Step 3: Build reveal transaction
    // - Create transaction spending the commit output by using Transaction.create()
    // - Pass input with commitTxId and commitVOut
    // - Set output to same owner and amount as commit tx
    // - Include witness data array with [Opcode.REVEAL, content]

    throw new Error("Not implemented");
  }
}
