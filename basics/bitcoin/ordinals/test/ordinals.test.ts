import { Bitcoin, Address, Transaction } from "../src/bitcoin";
import { Ordinals, createOutPoint } from "../src/ordinals";
import { expect } from "chai";

describe("Ordinals Satoshis Flow Tests", () => {
  let alice: Address;
  let bob: Address;
  let miner: Address;
  let bitcoin: Bitcoin;
  let ordinals: Ordinals;

  beforeEach(() => {
    alice = "0xalice";
    bob = "0xbob";
    miner = "0xminer";

    bitcoin = new Bitcoin();
    ordinals = new Ordinals();

    // Give Alice initial 10 coins in genesis block
    ordinals.observe(bitcoin.mine(alice));
    ordinals.observe(bitcoin.mine(alice));
  });

  /**
   * Test Scenario: Splitting UTXOs
   *
   * 1. Start with Alice's 10 satoshis from genesis blocks
   * 2. Split into two outputs:
   *    - 7 satoshis to Alice
   *    - 3 satoshis to Bob
   * 3. Verify satoshi ranges are correctly tracked:
   *    - Alice should get satoshis 0-5 and 5-7
   *    - Bob should get satoshis 7-9
   */
  it("should track satoshis when splitting UTXOs", () => {
    // Get Alice's initial transaction with 10 satoshis
    const transaction1 = bitcoin.blocks[0].txs[0];
    const transaction2 = bitcoin.blocks[1].txs[0];
    // Split UTXO: 7 to Alice, 3 to Bob
    const tx = Transaction.create(
      [
        { txId: transaction1.id, vOut: 0 },
        { txId: transaction2.id, vOut: 0 },
      ],
      [
        { address: alice, amount: 7 },
        { address: bob, amount: 3 },
      ]
    );

    bitcoin.pendingTransactions.push(tx);
    ordinals.observe(bitcoin.mine(miner));

    // Verify split satoshi ranges
    const aliceSats = ordinals.satoshis.get(createOutPoint(tx.id, 0));
    const bobSats = ordinals.satoshis.get(createOutPoint(tx.id, 1));

    expect(aliceSats).to.deep.equal([
      { start: 0, count: 5 },
      { start: 5, count: 2 },
    ]); // Alice gets satoshis 0-5 & 5-7
    expect(bobSats).to.deep.equal([{ start: 7, count: 3 }]); // Bob gets satoshis 7-9
  });

  /**
   * Test Scenario: Merging UTXOs
   *
   * 1. Start with Alice's 10 satoshis from genesis blocks
   * 2. First split into two UTXOs of 5 satoshis each
   * 3. Then merge these two UTXOs back into one UTXO of 10 satoshis
   * 4. Verify the merged satoshi ranges maintain their original ordering:
   *    - First range: satoshis 0-5
   *    - Second range: satoshis 5-10
   */
  it("should track satoshis when merging UTXOs", () => {
    // Get Alice's initial transaction with 10 satoshis
    const transaction1 = bitcoin.blocks[0].txs[0];
    const transaction2 = bitcoin.blocks[1].txs[0];

    // First split into two UTXOs of 5 satoshis each
    const tx = Transaction.create(
      [
        { txId: transaction1.id, vOut: 0 },
        { txId: transaction2.id, vOut: 0 },
      ],
      [
        { address: alice, amount: 5 },
        { address: alice, amount: 5 },
      ]
    );

    bitcoin.pendingTransactions.push(tx);
    ordinals.observe(bitcoin.mine(miner));

    // Merge the two UTXOs back together
    const mergeTx = Transaction.create(
      [
        { txId: tx.id, vOut: 0 },
        { txId: tx.id, vOut: 1 },
      ],
      [{ address: alice, amount: 10 }]
    );

    bitcoin.pendingTransactions.push(mergeTx);
    ordinals.observe(bitcoin.mine(miner));

    // Verify merged satoshi ranges
    const mergedSats = ordinals.satoshis.get(createOutPoint(mergeTx.id, 0));
    expect(mergedSats).to.deep.equal([
      { start: 0, count: 5 },
      { start: 5, count: 5 },
    ]);
  });

  /**
   * Test Scenario: Multi-output Transaction
   *
   * 1. Start with Alice's 10 satoshis from genesis blocks
   * 2. Split into three outputs:
   *    - 5 satoshis to Alice
   *    - 3 satoshis to Bob
   *    - 2 satoshis to Bob
   * 3. Verify satoshi ranges are correctly distributed:
   *    - Alice gets satoshis 0-4
   *    - Bob gets satoshis 5-7 (first output)
   *    - Bob gets satoshis 8-9 (second output)
   */
  it("should track satoshis in multi-output transactions", () => {
    const transaction1 = bitcoin.blocks[0].txs[0];
    const transaction2 = bitcoin.blocks[1].txs[0];

    // Split into 3 outputs: 5 to Alice, 3 and 2 to Bob
    const tx = Transaction.create(
      [
        { txId: transaction1.id, vOut: 0 },
        { txId: transaction2.id, vOut: 0 },
      ],
      [
        { address: alice, amount: 5 },
        { address: bob, amount: 3 },
        { address: bob, amount: 2 },
      ]
    );

    bitcoin.pendingTransactions.push(tx);
    ordinals.observe(bitcoin.mine(miner));

    // Verify satoshi distribution across all outputs
    const aliceSats = ordinals.satoshis.get(createOutPoint(tx.id, 0));
    const bobSats1 = ordinals.satoshis.get(createOutPoint(tx.id, 1));
    const bobSats2 = ordinals.satoshis.get(createOutPoint(tx.id, 2));

    expect(aliceSats).to.deep.equal([{ start: 0, count: 5 }]); // Alice gets satoshis 0-4
    expect(bobSats1).to.deep.equal([{ start: 5, count: 3 }]); // Bob gets satoshis 5-7
    expect(bobSats2).to.deep.equal([{ start: 8, count: 2 }]); // Bob gets satoshis 8-9
  });
});
