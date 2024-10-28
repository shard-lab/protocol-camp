import { ec as EC } from "elliptic";
import { createHash } from "crypto";
import keccak from "keccak";

const ec = new EC("secp256k1");

export function generateKeyPair(curveName: string = "secp256k1") {
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate("hex");
  const publicKey = keyPair.getPublic("hex");
  return { privateKey, publicKey };
}

export function signMessage(
  privateKey: string,
  message: string,
  hashAlgorithm: "none" | "sha256" | "keccak256" = "none"
): string {
  const key = ec.keyFromPrivate(privateKey, "hex");

  let msgHash;
  switch (hashAlgorithm) {
    case "none":
      msgHash = message;
      break;
    case "sha256":
      msgHash = createHash("sha256").update(message).digest();
      break;
    case "keccak256":
      msgHash = keccak("keccak256").update(message).digest();
      break;
    default:
      throw new Error("invalid hashAlgorithm");
  }

  const signature = key.sign(msgHash);
  return signature.toDER("hex");
}

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
  hashAlgorithm: "none" | "sha256" | "keccak256" = "none"
): boolean {
  const key = ec.keyFromPublic(publicKey, "hex");

  let msgHash;
  switch (hashAlgorithm) {
    case "none":
      msgHash = message;
      break;
    case "sha256":
      msgHash = createHash("sha256").update(message).digest();
      break;
    case "keccak256":
      msgHash = keccak("keccak256").update(message).digest();
      break;
    default:
      throw new Error("invalid hashAlgorithm");
  }

  return key.verify(msgHash, signature);
}
