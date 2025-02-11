import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { Script, UTXO, UnlockingScript, buildMerkleRoot, buildMerklePath, getLeafHash } from "../src/t2tr";

describe("UTXO (No proofData) - Extended Tests", () => {
    const ALICE_PUBKEY = "AlicePubKey";
    const MOM_PUBKEY = "MomPubKey";
    const BOB_PUBKEY = "BobPubKey";
    let scripts: Script[];
    let leafHashes: string[];
    let merkleRoot: string;
    let utxo: UTXO;
  
    describe("Single Script scenario", () => {
      beforeEach(() => {
        scripts = [new Script(ALICE_PUBKEY, "SINGLE_CONDITION")];
        leafHashes = scripts.map(getLeafHash);
        merkleRoot = buildMerkleRoot(leafHashes);
        utxo = new UTXO(ALICE_PUBKEY, merkleRoot);
      });
  
      it("should succeed with single script (empty merklePath)", () => {
        const chosenLeaf = leafHashes[0];
        const merklePathArr = buildMerklePath(0, leafHashes);
        expect(merklePathArr).to.be.empty;
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, merklePathArr);
        const result = utxo.verifyScriptPath(unlocking);
        expect(result).to.be.true;
      });
  
      it("should fail if merklePath is incorrectly non-empty", () => {
        const chosenLeaf = leafHashes[0];
        const merklePathArr = ["abcdef12345"];
  
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, merklePathArr);
        expect(utxo.verifyScriptPath(unlocking)).to.be.false;
      });
    });
  
    describe("Two Scripts scenario", () => {
      beforeEach(() => {
        scripts = [
          new Script(ALICE_PUBKEY, "ALICE_ONLY"),
          new Script(MOM_PUBKEY, "MOM_ONLY"),
        ];
        leafHashes = scripts.map(getLeafHash);
        merkleRoot = buildMerkleRoot(leafHashes);
        utxo = new UTXO(ALICE_PUBKEY, merkleRoot);
      });
  
      it("should verify with correct publicKey for leafIndex=0", () => {
        const leafIndex = 0;
        const chosenLeaf = leafHashes[leafIndex];
        const merklePathArr = buildMerklePath(leafIndex, leafHashes);
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, merklePathArr);
        expect(utxo.verifyScriptPath(unlocking)).to.be.true;
      });
  
      it("should fail if publicKey mismatch", () => {
        const leafIndex = 0;
        const chosenLeaf = leafHashes[leafIndex];
        const merklePathArr = buildMerklePath(leafIndex, leafHashes);
        const unlocking = new UnlockingScript(BOB_PUBKEY, chosenLeaf, merklePathArr);
        expect(utxo.verifyScriptPath(unlocking)).to.be.false;
      });
  
      it("should fail if merklePath is empty (should have 1 sibling for 2 leaves)", () => {
        const leafIndex = 1; 
        const chosenLeaf = leafHashes[leafIndex];
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, []);
        expect(utxo.verifyScriptPath(unlocking)).to.be.false;
      });
    });
  
    describe("Three Scripts scenario", () => {
      beforeEach(() => {
        scripts = [
          new Script(ALICE_PUBKEY, "COND_A"),
          new Script(MOM_PUBKEY, "COND_B"),
          new Script(BOB_PUBKEY, "COND_C"),
        ];
        leafHashes = scripts.map(getLeafHash);
        merkleRoot = buildMerkleRoot(leafHashes);
        utxo = new UTXO(ALICE_PUBKEY, merkleRoot);
      });
  
      it("should pass for the 1st leaf (index=0) if we build the correct merklePath", () => {
        const leafIndex = 0;
        const chosenLeaf = leafHashes[leafIndex];
        const merklePathArr = buildMerklePath(leafIndex, leafHashes);
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, merklePathArr);
        expect(utxo.verifyScriptPath(unlocking)).to.be.true;
      });
  
      it("should fail if we pick the 2nd leaf but use the 0th leaf's merklePath", () => {
        const chosenLeaf = leafHashes[1];
        const wrongPath = buildMerklePath(0, leafHashes);
        const unlocking = new UnlockingScript(ALICE_PUBKEY, chosenLeaf, wrongPath);
        expect(utxo.verifyScriptPath(unlocking)).to.be.false;
      });
  
      it("should fail if publicKey is something else (BobPubKey)", () => {
        const leafIndex = 2;
        const chosenLeaf = leafHashes[leafIndex];
        const merklePathArr = buildMerklePath(leafIndex, leafHashes);
        const unlocking = new UnlockingScript(BOB_PUBKEY, chosenLeaf, merklePathArr);
        expect(utxo.verifyScriptPath(unlocking)).to.be.false;
      });
    });
  });