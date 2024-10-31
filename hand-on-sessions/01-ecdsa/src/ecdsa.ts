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
  throw new Error("implement me!!");
}

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
  hashAlgorithm: "none" | "sha256" | "keccak256" = "none"
): boolean {
  throw new Error("implement me!!");
}
