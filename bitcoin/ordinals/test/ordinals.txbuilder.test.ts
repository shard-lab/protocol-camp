import { Bitcoin, Address } from "../src/bitcoin";
import { TransactionBuilder } from "../src/ordinals.txbuilder";
import { Ordinals, createOutPoint } from "../src/ordinals";
import { expect } from "chai";

describe("Ordinals Create and Reveal Transaction Tests", () => {
  let alice: Address;
  let miner: Address;

  let bitcoin: Bitcoin;
  let ordinals: Ordinals;
  let txBuilder: TransactionBuilder;

  beforeEach(() => {
    // Initialize addresses needed for testing
    alice = "0xalice";
    miner = "0xminer";

    // Create instances of Bitcoin, Ordinals, and TransactionBuilder
    bitcoin = new Bitcoin();
    ordinals = new Ordinals();
    txBuilder = new TransactionBuilder(bitcoin);

    // Give initial coins to Alice through genesis block
    const genesisBlock = bitcoin.mine(alice);
    ordinals.observe(genesisBlock);
  });

  /**
   * Test Flow:
   *
   * 1. Prepare test data
   *    - Get Alice's initial transaction from genesis block
   *    - Define content to inscribe ("Hello")
   *
   * 2. Create and process Commit transaction
   *    - Create commit tx with content hash
   *    - Add to pending queue and mine
   *    - Register with Ordinals to track UTXOs
   *
   *    Alice's UTXO ──────┐
   *                       v
   *    [Content Hash] ──> Commit TX ──> New UTXO
   *
   * 3. Create and process Reveal transaction
   *    - Create reveal tx with actual content
   *    - Add to pending queue and mine
   *    - Register with Ordinals to track inscriptions
   *
   *    Commit TX UTXO ───┐
   *                      v
   *    [Content] ──────> Reveal TX ──> Inscribed UTXO
   *
   * 4. Verify inscription
   *    - Check satoshi ranges exist
   *    - Verify inscription content matches original
   */
  it("should create and reveal an inscription", () => {
    // Prepare test data
    // - Get Alice's first transaction (first transaction in genesis block)
    const aliceTransaction = bitcoin.blocks[0].txs[0];
    // - Define content to be inscribed
    const content = "Protocol Camp";

    // Step 1: Create and process Commit transaction
    // - Create Commit transaction containing hash of inscription content
    const commitTx = txBuilder.createCommitTransaction({
      spender: alice,
      txId: aliceTransaction.id,
      vOut: 0,
      content: content,
    });

    // - Add Commit transaction to queue
    bitcoin.pendingTransactions.push(commitTx);
    // - Mine it into a block and Register block with Ordinals system to track UTXOs
    ordinals.observe(bitcoin.mine(miner));

    // Step 2: Create and process Reveal transaction
    // - Create Reveal transaction containing actual inscription content
    const revealTx = txBuilder.createRevealTransaction({
      spender: alice,
      txId: commitTx.id,
      vOut: 0,
      content: content,
    });
    // - Add Reveal transaction to queue and mine it into a block
    bitcoin.pendingTransactions.push(revealTx);
    // - Mine it into a block and Register block with Ordinals system to track inscriptions
    ordinals.observe(bitcoin.mine(miner));

    // Step 3: Verify inscription
    // - Create output point for Reveal transaction
    const outPoint = createOutPoint(revealTx.id, 0);
    // - Check satoshi ranges for this output
    const satRanges = ordinals.satoshis.get(outPoint);
    expect(satRanges).not.to.be.undefined;
    // - Verify inscription content on first satoshi
    const inscription = ordinals.inscriptions.get(satRanges![0].start);
    expect(inscription?.content).to.equal(content);
  });
});
