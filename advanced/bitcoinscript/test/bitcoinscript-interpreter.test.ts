import { expect } from "chai";
import {
  BitcoinScriptInterpreter,
  OpCode,
  hash160,
  opCodeFunctions,
  sha256,
} from "../src/bitcoinscript-interpreter";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

describe("#BitcoinScriptInterpreter Hands-on Session", () => {
  describe("OpCode Functions", () => {
    describe("OP_DUP", () => {
      it("should duplicate the top stack element", () => {
        const stack: Buffer[] = [Buffer.from("test")];
        opCodeFunctions[OpCode.OP_DUP](stack);

        expect(stack).to.have.lengthOf(2);
        expect(stack[0]).to.deep.equal(stack[1]);
      });

      it("should throw an error if the stack is empty", () => {
        const stack: Buffer[] = [];
        expect(() => opCodeFunctions[OpCode.OP_DUP](stack)).to.throw("Stack underflow");
      });
    });

    describe("OP_HASH160", () => {
      it("should hash the top stack element", () => {
        const stack: Buffer[] = [Buffer.from("hello")];
        opCodeFunctions[OpCode.OP_HASH160](stack);

        expect(stack).to.have.lengthOf(1);
        expect(stack[0]).to.have.lengthOf(20);
      });

      it("should throw an error if the stack is empty", () => {
        const stack: Buffer[] = [];
        expect(() => opCodeFunctions[OpCode.OP_HASH160](stack)).to.throw("Stack underflow");
      });
    });

    describe("OP_EQUALVERIFY", () => {
      it("should verify equality of the top two stack elements", () => {
        const stack: Buffer[] = [Buffer.from("value"), Buffer.from("value")];
        expect(() => opCodeFunctions[OpCode.OP_EQUALVERIFY](stack)).to.not.throw();
        expect(stack).to.have.lengthOf(0);
      });

      it("should throw an error if the stack has less than two elements", () => {
        const stack: Buffer[] = [Buffer.from("value")];
        expect(() => opCodeFunctions[OpCode.OP_EQUALVERIFY](stack)).to.throw("Stack underflow");
      });

      it("should throw an error if the elements are not equal", () => {
        const stack: Buffer[] = [Buffer.from("value1"), Buffer.from("value2")];
        expect(() => opCodeFunctions[OpCode.OP_EQUALVERIFY](stack)).to.throw("Verification failed");
      });
    });

    describe("OP_CHECKSIG", () => {
      it("should verify a valid signature", () => {
        const keyPair = ec.genKeyPair();
        const publicKey = Buffer.from(keyPair.getPublic("hex"), "hex");
        const message = Buffer.from("Transaction data to be signed");
        const msgHash = sha256(message);
        const signature = Buffer.from(keyPair.sign(msgHash).toDER());

        const stack: Buffer[] = [signature, publicKey];
        opCodeFunctions[OpCode.OP_CHECKSIG](stack);
        expect(stack).to.have.lengthOf(1);
        expect(stack[0][0]).to.equal(1);
      });

      it("should fail to verify an invalid signature", () => {
        const keyPair = ec.genKeyPair();
        const publicKey = Buffer.from(keyPair.getPublic("hex"), "hex");
        const invalidSignature = Buffer.from("invalid_signature");
        const stack: Buffer[] = [invalidSignature, publicKey];

        expect(() => opCodeFunctions[OpCode.OP_CHECKSIG](stack)).to.throw();
      });

      it("should throw an error if the stack has less than two elements", () => {
        const stack: Buffer[] = [Buffer.from("signature")];
        expect(() => opCodeFunctions[OpCode.OP_CHECKSIG](stack)).to.throw("Stack underflow");
      });
    });
  });

  describe("BitcoinScriptInterpreter", () => {
    it("should correctly execute a valid script", () => {
      const keyPair = ec.genKeyPair();
      const publicKey = Buffer.from(keyPair.getPublic("hex"), "hex");

      const message = Buffer.from("Transaction data to be signed");
      const msgHash = sha256(message);
      const signature = Buffer.from(keyPair.sign(msgHash).toDER());
      const pubKeyHash = hash160(publicKey);
      const unlockingScript: (OpCode | Buffer)[] = [signature, publicKey];
      const lockingScript: (OpCode | Buffer)[] = [
        OpCode.OP_DUP,
        OpCode.OP_HASH160,
        pubKeyHash,
        OpCode.OP_EQUALVERIFY,
        OpCode.OP_CHECKSIG,
      ];
      const script = [...unlockingScript, ...lockingScript];

      const interpreter = new BitcoinScriptInterpreter();
      const isValid = interpreter.executeScript(script);
      expect(isValid).to.be.true;
    });

    it("should fail on an invalid script", () => {
      const keyPair = ec.genKeyPair();
      const publicKey = Buffer.from(keyPair.getPublic("hex"), "hex");

      const message = Buffer.from("Invalid transaction data");
      const msgHash = sha256(message);
      const signature = Buffer.from(keyPair.sign(msgHash).toDER());
      const pubKeyHash = hash160(publicKey);
      const unlockingScript: (OpCode | Buffer)[] = [signature, publicKey];
      const lockingScript: (OpCode | Buffer)[] = [
        OpCode.OP_DUP,
        OpCode.OP_HASH160,
        pubKeyHash,
        OpCode.OP_EQUALVERIFY,
        OpCode.OP_CHECKSIG,
      ];
      const script = [...unlockingScript, ...lockingScript];

      const interpreter = new BitcoinScriptInterpreter();
      const isValid = interpreter.executeScript(script);
      expect(isValid).to.be.false;
    });

    it("should throw an error if the script result is not 0 or 1", () => {
      const interpreter = new BitcoinScriptInterpreter();
      const invalidScript: (OpCode | Buffer)[] = [Buffer.from("arbitrary_data")];

      expect(() => interpreter.executeScript(invalidScript)).to.throw("Invalid script result");
    });

    it("should correctly execute a P2SH script", () => {
      const keyPair = ec.genKeyPair();
      const publicKey = Buffer.from(keyPair.getPublic("hex"), "hex");
      const pubKeyHash = hash160(publicKey);

      const redeemScript: (OpCode | Buffer)[] = [
        OpCode.OP_DUP,
        OpCode.OP_HASH160,
        pubKeyHash,
        OpCode.OP_EQUALVERIFY,
        OpCode.OP_CHECKSIG,
      ];

      const scriptHash = hash160(BitcoinScriptInterpreter.serializeScript(redeemScript));

      const lockingScript: (OpCode | Buffer)[] = [OpCode.OP_HASH160, scriptHash, OpCode.OP_EQUAL];

      const message = Buffer.from("Transaction data to be signed");
      const msgHash = sha256(message);
      const signature = Buffer.from(keyPair.sign(msgHash).toDER());

      const unlockingScript: (OpCode | Buffer)[] = [
        signature,
        publicKey,
        BitcoinScriptInterpreter.serializeScript(redeemScript),
      ];

      const script = [...unlockingScript, ...lockingScript];

      const interpreter = new BitcoinScriptInterpreter();
      const isValid = interpreter.executeScript(script);
      expect(isValid).to.be.true;
    });
  });
});
