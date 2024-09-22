import { createHash } from "crypto";

export class MerkleTree {
  leaves: string[];
  root: string;

  constructor(elements: string[]) {
    this.leaves = elements.map((el) => MerkleTree.hash(el));
    this.root = this.computeMerkleRoot(this.leaves);
  }

  private computeMerkleRoot(elements: string[]): string {
    throw new Error("implement me!");
  }

  verifyProof(leaf: string, proof: string[]): boolean {
    let computedHash = MerkleTree.hash(leaf);

    for (const data of proof) {
      const hash1 = BigInt("0x" + computedHash);
      const hash2 = BigInt("0x" + data);

      if (hash1 <= hash2) {
        computedHash = MerkleTree.hash(computedHash + data);
      } else {
        computedHash = MerkleTree.hash(data + computedHash);
      }
    }

    return computedHash === this.root;
  }

  getProof(index: number): string[] {
    const proof: string[] = [];
    let currentIndex = index;
    let elements = [...this.leaves];

    while (elements.length > 1) {
      const newElements: string[] = [];

      if (elements.length % 2 !== 0) {
        elements.push(elements[elements.length - 1]);
      }

      for (let i = 0; i < elements.length; i += 2) {
        const element1 = elements[i];
        const element2 = elements[i + 1];

        if (i === currentIndex || i + 1 === currentIndex) {
          const siblingIndex = i === currentIndex ? i + 1 : i;
          proof.push(elements[siblingIndex]);
        }

        const hash1 = BigInt("0x" + element1);
        const hash2 = BigInt("0x" + element2);
        const combinedHash =
          hash1 <= hash2
            ? MerkleTree.hash(element1 + element2)
            : MerkleTree.hash(element2 + element1);

        newElements.push(combinedHash);
      }

      currentIndex = Math.floor(currentIndex / 2);
      elements = newElements;
    }

    return proof;
  }

  static hash(data: string): string {
    return createHash("sha256").update(data).digest("hex");
  }
}
