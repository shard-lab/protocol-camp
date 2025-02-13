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
  
  const merklePath: string[] = [];
  let currentLevel = [...leafHashes];
  let currentIndex = leafIndex;

  while (currentLevel.length > 1) {
    const isEven = currentIndex % 2 === 0;
    const siblingIndex = isEven ? currentIndex + 1 : currentIndex - 1;
    
    if (siblingIndex < currentLevel.length) {
      merklePath.push(currentLevel[siblingIndex]);
    } else {
      merklePath.push(currentLevel[currentIndex]);
    }

    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        nextLevel.push(sha256Hex(currentLevel[i] + currentLevel[i + 1]));
      } else {
        nextLevel.push(currentLevel[i]);
      }
    }
    
    currentIndex = Math.floor(currentIndex / 2);
    currentLevel = nextLevel;
  }

  return merklePath;
}

export class UTXO {
  public publicKey: PublicKey;
  public merkleRoot: string;

  constructor(publicKey: PublicKey, merkleRoot: string) {
    this.publicKey = publicKey;
    this.merkleRoot = merkleRoot;
  }

  // check if the unlocking script is valid
  // 1. check if the public key is the same
  // 2. check if the leaf hash is the same
  // 3. check if the merkle path is the same
  // 4. return true if all the above are true
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