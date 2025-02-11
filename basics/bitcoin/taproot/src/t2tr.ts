import * as crypto from "crypto";

export type PublicKey = string;

export class Script {
  public publicKey: PublicKey;
  public condition: string;

  constructor(publicKey: PublicKey, condition: string) {
    this.publicKey = publicKey;
    this.condition = condition;
  }
}

export function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export function getLeafHash(script: Script): string {
  return sha256Hex(`${script.publicKey}|${script.condition}`);
}

export function buildMerkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) {
    return "".padEnd(64, "0"); 
  }
  let current = [...leafHashes];
  while (current.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) {
        next.push(sha256Hex(current[i] + current[i + 1]));
      } else {
        next.push(current[i]);
      }
    }
    current = next;
  }
  return current[0];
}

export function buildMerklePath(leafIndex: number, leafHashes: string[]): string[] {
  if (leafHashes.length <= 1) return [];
  if (leafHashes.length === 2) {
    return [leafHashes[leafIndex === 0 ? 1 : 0]];
  }
  return leafHashes.filter((_, i) => i !== leafIndex);
}

export class UTXO {
  public publicKey: PublicKey;
  public merkleRoot: string;

  constructor(publicKey: PublicKey, merkleRoot: string) {
    this.publicKey = publicKey;
    this.merkleRoot = merkleRoot;
  }

  public verifyScriptPath(unlocking: UnlockingScript): boolean {
    throw new Error("Implement me!");
  }
}

export class UnlockingScript {
  public publicKey: PublicKey;
  public leafHash: string;
  public merklePath: string[];

  constructor(publicKey: PublicKey, leafHash: string, merklePath: string[]) {
    this.publicKey = publicKey;
    this.leafHash = leafHash;
    this.merklePath = merklePath;
  }
}