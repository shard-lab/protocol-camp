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
    const { spender, txId, vOut, content } = params;

    // Get the input transaction that we'll spend
    const transaction = this.bitcoin.getTransaction(txId);
    if (!transaction) {
      throw new Error("transaction not found");
    }

    // Get the specific output we want to spend
    const output = transaction.outputs[vOut];
    if (!output) {
      throw new Error("Output not found");
    }

    // Verify that the spender owns this output
    if (output.address !== spender) {
      throw new Error("Not the owner of this output");
    }

    // Create the commit transaction:
    // 1. Hash the content to create commitment
    const commit = sha256Hex(content);

    // 2. Set up witness stack with inscription opcode and commitment
    const witness = [Opcode.INSCRIBE, commit];

    // 3. Create transaction that:
    // - Spends the input UTXO (txId:vOut)
    // - Creates new output owned by same address with same amount
    // - Includes witness data with commitment
    const commitTx = Transaction.create(
      [{ txId: transaction.id, vOut }],
      [{ address: spender, amount: output.amount }],
      witness
    );

    return commitTx;
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
    const { spender, txId, vOut, content } = params;

    // Get the commit transaction we'll spend
    const transaction = this.bitcoin.getTransaction(txId);
    if (!transaction) {
      throw new Error("transaction not found");
    }

    // Get the output containing our inscription
    const output = transaction.outputs[vOut];
    if (!output) {
      throw new Error("output not found");
    }

    // Verify that the spender owns this output
    if (output.address !== spender) {
      throw new Error("Not the owner of this output");
    }

    // Get the commitment hash from the commit transaction's witness data
    const commit = transaction.witness[1];
    if (!commit) {
      throw new Error("commit not found");
    }

    // Verify that the revealed content matches the original commitment
    const revealHash = sha256Hex(content);
    if (revealHash !== commit) {
      throw new Error("commit mismatch");
    }

    // Set up witness stack with reveal opcode and original content
    const witness = [Opcode.REVEAL, content];

    // Create reveal transaction that:
    // - Spends the commit transaction output
    // - Creates new output owned by same address with same amount
    // - Includes witness data with revealed content
    const revealTx = Transaction.create(
      [{ txId, vOut }],
      [{ address: spender, amount: output.amount }],
      witness
    );

    return revealTx;
  }
}
