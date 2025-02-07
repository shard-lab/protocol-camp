import { generateKeyPair, signMessage, verifySignature } from "../src/ecdsa";
import { expect } from "chai";

describe("#ECDSA Hands-on Session", function () {
  const alicePrivateKey = "eaf85898356aeb4c286fdb3458a65f6e0596bb57ea1bc96fc486c371773b9643";
  const alicePublicKey =
    "04a08f1fe79a520a436de3f48781725652f4ee38db584b92f54c8832f6abd50c2361c97e99aeb3284d7f7a00c4ad8d6c832944b999e4ae862cd0ba610d533e4306";

  const rawMessageSignature =
    "30450220538d1eb3c69d5daea176dce31043935e2309e9de49b6b26926b138fe0b9e018e022100b054ff628d3f7c6b65d885ddaa07aa696079fd2f0d9b21c7e550e0fa95cef500";
  const sha256HashedMessageSignature =
    "30440220791d71bea5978775625df9a1f469de23b6d7461557c1930d9de7a859e5115ed002205171c4150110f23c5a9aa85537235d4712d25c201cf6ce93f4c724c5c6b9a60d";
  const keccak256HashedmessageSignature =
    "30450220660ce020604d195da35b5ac79b4e9b68e61630af6078a507d9d445285c94a84a0221009c3f3909910d0a6530d3443c475d0ea5e7539eff14f7502d579ef806a0e2e1f1";

  it("should generate a random key pair", function () {
    const { privateKey, publicKey } = generateKeyPair();
    expect(privateKey).to.exist;
    expect(publicKey).to.exist;

    console.log(`Private Key(hex): ${privateKey}`);
    console.log(`Public Key(hex): ${publicKey}`);
  });

  describe("Alice & Bob Scenario", function () {
    it("should sign a raw message with Alice's private key", function () {
      const message = "I am Alice";
      const signature = signMessage(alicePrivateKey, message);
      expect(signature).to.equal(rawMessageSignature);
    });

    it("should verify Alice's signature (raw) with her public key", function () {
      const message = "I am Alice";
      const isValid = verifySignature(message, rawMessageSignature, alicePublicKey);
      expect(isValid).to.be.true;
    });

    it("should sign a sha-256 message with Alice's private key", function () {
      const message = "I am Alice";
      const signature = signMessage(alicePrivateKey, message, "sha256");
      expect(signature).to.equal(sha256HashedMessageSignature);
    });

    it("should verify Alice's signature (sha256) with her public key", function () {
      const message = "I am Alice";
      const isValid = verifySignature(
        message,
        sha256HashedMessageSignature,
        alicePublicKey,
        "sha256"
      );
      expect(isValid).to.be.true;
    });

    it("should sign a keccak-256 message with Alice's private key", function () {
      const message = "I am Alice";
      const signature = signMessage(alicePrivateKey, message, "keccak256");
      expect(signature).to.equal(keccak256HashedmessageSignature);
    });

    it("should verify Alice's signature (keccak256) with her public key", function () {
      const message = "I am Alice";
      const isValid = verifySignature(
        message,
        keccak256HashedmessageSignature,
        alicePublicKey,
        "keccak256"
      );
      expect(isValid).to.be.true;
    });
  });
});
