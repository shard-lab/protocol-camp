import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Node, UTXO } from "../src/ordinals"; 

describe("Ordinals Tests", () => {
  let node: Node;
  const ALICE = "AlicePubKey";
  const BOB = "BobPubKey";
  const CHARLIE = "CharliePubKey";

  beforeEach(() => {
    node = new Node();
  });

  describe("A) CommitTx Tests", () => {
    it("should commit a single sat as NFT, leftover remain", () => {
      const base = node.mineBlock(ALICE);
      const commitUtxo = node.createCommitTx({
        inputUtxoId: base.id,
        spenderPubKey: ALICE,
        hiddenContent: "NFT#10",
        selectedSatIds: [10],
      });
      const all = node.listUTXOs();
      expect(all).to.have.length(2);
      const c = all.find(u => u.id === commitUtxo.id)!;
      expect(c.satoshis).to.have.length(1);
      expect(c.satoshis[0].id).to.equal(10);
    });

    it("should fail if pubKey mismatch", () => {
      const base = node.mineBlock(ALICE);
      expect(() => {
        node.createCommitTx({
          inputUtxoId: base.id,
          spenderPubKey: BOB, // BOB tries
          hiddenContent: "Malicious",
        });
      }).to.throw("Signature mismatch!");
    });

    it("should fail if selected sat not in UTXO", () => {
      const base = node.mineBlock(ALICE);
      expect(() => {
        node.createCommitTx({
          inputUtxoId: base.id,
          spenderPubKey: ALICE,
          hiddenContent: "FakeNFT",
          selectedSatIds: [999],
        });
      }).to.throw("Some selected satoshis not found in the UTXO");
    });
  });

  describe("B) RevealTx Tests", () => {
    let commitUtxo: UTXO;
    const content = "SecretNFT";

    beforeEach(() => {
      const base = node.mineBlock(ALICE);
      commitUtxo = node.createCommitTx({
        inputUtxoId: base.id,
        spenderPubKey: ALICE,
        hiddenContent: content,
      });
    });

    it("should reveal with correct content", () => {
      const revealUtxo = node.createRevealTx({
        commitUtxoId: commitUtxo.id,
        spenderPubKey: ALICE,
        actualContent: content,
      });
      const all = node.listUTXOs();
      expect(all).to.have.length(1);
      expect(all[0]).to.deep.equal(revealUtxo);
      expect(revealUtxo.lockingScript).to.include(content);
    });

    it("should fail if content mismatch", () => {
      expect(() => {
        node.createRevealTx({
          commitUtxoId: commitUtxo.id,
          spenderPubKey: ALICE,
          actualContent: "WrongData",
        });
      }).to.throw("Content mismatch with commit!");
    });

    it("should fail if pubKey mismatch", () => {
      expect(() => {
        node.createRevealTx({
          commitUtxoId: commitUtxo.id,
          spenderPubKey: BOB,
          actualContent: content,
        });
      }).to.throw("Signature mismatch!");
    });
  });

  describe("C) TransferTx Tests", () => {
    let base: UTXO;

    beforeEach(() => {
      base = node.mineBlock(ALICE);
    });

    it("should transfer entire UTXO from ALICE to BOB", () => {
      const transferred = node.createTransferTx({
        inputUtxoId: base.id,
        spenderPubKey: ALICE,
        newOwnerPubKey: BOB,
      });
      const all = node.listUTXOs();
      expect(all).to.have.length(1);
      expect(all[0]).to.deep.equal(transferred);
      expect(transferred.ownerPubKey).to.equal(BOB);
      expect(transferred.satoshis).to.have.length(50);
    });

    it("should transfer partial satoshis, leftover remain", () => {
      const partial = node.createTransferTx({
        inputUtxoId: base.id,
        spenderPubKey: ALICE,
        newOwnerPubKey: BOB,
        selectedSatIds: [1, 2, 3],
      });
      const all = node.listUTXOs();
      expect(all).to.have.length(2);
      expect(partial.ownerPubKey).to.equal(BOB);
      expect(partial.satoshis.map(s=>s.id)).to.deep.equal([1,2,3]);
    });

    it("should fail if pubKey mismatch", () => {
      expect(() => {
        node.createTransferTx({
          inputUtxoId: base.id,
          spenderPubKey: BOB,
          newOwnerPubKey: CHARLIE,
        });
      }).to.throw("Signature mismatch!");
    });
  });

  describe("D) NFT Transfer scenario", () => {
    it("should let user transfer commit UTXO to another pubKey, then they reveal", () => {
      const mined = node.mineBlock(ALICE);
      const cU = node.createCommitTx({
        inputUtxoId: mined.id,
        spenderPubKey: ALICE,
        hiddenContent: "NFT#10",
        selectedSatIds: [10],
      });
      expect(node.listUTXOs()).to.have.length(2);

      const bobUtxo = node.createTransferTx({
        inputUtxoId: cU.id,
        spenderPubKey: ALICE,
        newOwnerPubKey: BOB,
      });

      const rU = node.createRevealTx({
        commitUtxoId: bobUtxo.id,
        spenderPubKey: BOB,
        actualContent: "NFT#10",
      });

      const all = node.listUTXOs();
      expect(all).to.have.length(2);
      const foundR = all.find(u => u.id === rU.id);
      expect(foundR).to.exist;
      expect(foundR!.ownerPubKey).to.equal(BOB);
      expect(foundR!.lockingScript).to.include("NFT#10");
    });

    it("should let user commit & reveal an NFT sat, then transfer that revealed NFT to someone else", () => {
        const block = node.mineBlock(ALICE);
      
        const commitUtxo = node.createCommitTx({
          inputUtxoId: block.id,
          spenderPubKey: ALICE,
          hiddenContent: "NFT#25",
          selectedSatIds: [25],
        });

        const revealUtxo = node.createRevealTx({
          commitUtxoId: commitUtxo.id,
          spenderPubKey: ALICE,
          actualContent: "NFT#25",
        });
      
        const afterRevealAll = node.listUTXOs();
        expect(afterRevealAll).to.have.length(2);
        const revealed = afterRevealAll.find(u => u.id === revealUtxo.id)!;
        expect(revealed.satoshis).to.have.length(1);
        expect(revealed.satoshis[0].id).to.equal(25);
        expect(revealed.ownerPubKey).to.equal(ALICE);
      
        const transferredToBob = node.createTransferTx({
          inputUtxoId: revealed.id,
          spenderPubKey: ALICE,
          newOwnerPubKey: BOB,
        });
      
        const finalAll = node.listUTXOs();
        expect(finalAll).to.have.length(2);
      
        const bobPart = finalAll.find(u => u.ownerPubKey === BOB)!;
        expect(bobPart.satoshis).to.have.length(1);
        expect(bobPart.satoshis[0].id).to.equal(25);
      
        const leftover = finalAll.find(u => u.ownerPubKey === ALICE && u.id !== bobPart.id)!;
        expect(leftover.satoshis).to.have.length(49);
      });
      
  });
});
