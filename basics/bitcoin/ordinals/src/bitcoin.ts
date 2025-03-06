import { randomUUID } from "crypto";

// Note: This example does not perform rigorous transaction validation.
// It is a simplified model designed to demonstrate how to track bitcoin
// at the satoshi level. The focus is on ordinal tracking rather than
// transaction verification.

/**
 * Represents a Bitcoin address as a string
 */
export type Address = string;

/**
 * Represents a Bitcoin block in the blockchain
 */
export class Block {
  height: number; // Block height
  txs: Transaction[]; // Transactions included in this block

  /**
   * Creates a new Block instance
   * @param height - The block height in the blockchain
   * @param txs - Array of transactions included in this block
   */
  constructor(height: number, txs: Transaction[]) {
    this.height = height;
    this.txs = txs;
  }

  /**
   * Factory method to create a new Block
   * @param height - The block height in the blockchain
   * @param txs - Array of transactions included in this block
   * @returns A new Block instance
   */
  static create(height: number, txs: Transaction[]): Block {
    return new Block(height, txs);
  }
}

/**
 * Represents a Bitcoin transaction
 */
export class Transaction {
  public id: string; // Transaction identifier
  public inputs: Array<{ txId: string; vOut: number }>; // References to previous transaction outputs being spent
  public outputs: Array<{ address: Address; amount: number }>; // New outputs created by this transaction

  /**
   * Creates a new Transaction instance
   * @param id - Transaction identifier
   * @param inputs - References to previous transaction outputs being spent
   * @param outputs - New outputs created by this transaction
   */
  constructor(
    id: string,
    inputs: Array<{ txId: string; vOut: number }>,
    outputs: Array<{ address: Address; amount: number }>
  ) {
    this.id = id;
    this.inputs = inputs;
    this.outputs = outputs;
  }

  /**
   * Factory method to create a new Transaction with a random UUID
   * @param inputs - References to previous transaction outputs being spent
   * @param outputsData - New outputs to be created by this transaction
   * @returns A new Transaction instance with a random ID
   */
  static create(
    inputs: Array<{ txId: string; vOut: number }>,
    outputsData: Array<{ address: string; amount: number }>
  ): Transaction {
    const txId = randomUUID(); // Generate a random transaction ID
    return new Transaction(txId, inputs, outputsData);
  }
}

/**
 * Main Bitcoin class that manages the blockchain and transactions
 */
export class Bitcoin {
  public static blocks: Block[] = [];
  public static pendingTransactions: Transaction[] = [];

  /**
   * Mines a new block and adds it to the blockchain.
   *
   * This method:
   * 1. Creates a coinbase transaction that rewards the miner
   * 2. Includes all pending transactions in the new block
   * 3. Adds the new block to the blockchain
   * 4. Clears the pending transactions pool
   *
   * @param miner - The Bitcoin address of the miner who will receive the block reward
   * @returns The newly created and mined block
   */
  static mine(miner: Address): Block {
    // Coinbase transaction is the first transaction in a block
    // It's created by miners and has no inputs (doesn't spend any previous outputs)
    // It includes the block reward (newly created bitcoins) and transaction fees
    // This special transaction allows new bitcoins to enter circulation as mining rewards
    const coinbaseTransaction = Transaction.create(
      [], // No inputs for coinbase transaction
      [{ address: miner, amount: 5 }] // Mining reward of 5 BTC
    );

    // Add coinbase transaction to pending transactions
    const transactions = [coinbaseTransaction, ...this.pendingTransactions];

    // Create new block with current height and all pending transactions
    const newBlock = Block.create(this.blocks.length, transactions);

    // Add the new block to the blockchain
    this.blocks.push(newBlock);

    // Clear pending transactions
    this.pendingTransactions = [];

    return newBlock;
  }
}
