import { createHash } from "crypto";
import { KVDB } from "./db";

export type Hash = string;

export enum NodeType {
  LEAF = "leaf",
  BRANCH = "branch",
}

export abstract class TrieNode {
  abstract type: NodeType;
  abstract hash(): Hash;
  abstract serialize(): Buffer;
}

export class LeafNode extends TrieNode {
  type: NodeType = NodeType.LEAF;

  constructor(
    public key: string,
    public value: number
  ) {
    super();
  }

  serialize(): Buffer {
    const valueBuf = Buffer.alloc(8);
    valueBuf.writeBigInt64BE(BigInt(this.value));

    return Buffer.concat([Buffer.from([0]), Buffer.from(this.key), valueBuf]);
  }

  hash(): Hash {
    return createHash("sha256").update(this.serialize()).digest("hex");
  }
}

export class BranchNode extends TrieNode {
  type: NodeType = NodeType.BRANCH;

  constructor(public children: (Hash | null)[]) {
    super();
  }

  serialize(): Buffer {
    return Buffer.concat([
      Buffer.from([1]),
      ...this.children.map((h) =>
        h ? Buffer.from(h.replace(/^0x/, ""), "hex") : Buffer.alloc(32, 0)
      ),
    ]);
  }

  hash(): Hash {
    return createHash("sha256").update(this.serialize()).digest("hex");
  }
}

export class HexaTree {
  EMPTY_TREE_ROOT: Hash = "56e81f171bcc55a6ff8345e69d5c7dbb273d1a4217b5e31eecfb5a6b9554d0e7";

  constructor(private db: KVDB) {}

  async set(parent: Hash | null, key: string, value: number, depth: number = 0): Promise<Hash> {
    if (parent === this.EMPTY_TREE_ROOT) {
      parent = null;
    }

    const path = this.getHexPath(key);
    if (!parent) {
      const leaf = new LeafNode(key, value);
      await this.db.put(leaf);
      return leaf.hash();
    }

    const node = await this.db.get(parent);
    if (!node) {
      const leaf = new LeafNode(key, value);
      await this.db.put(leaf);
      return leaf.hash();
    }

    if (node.type === NodeType.BRANCH) {
      const branchNode = node as BranchNode;
      const children = [...branchNode.children];
      const nibble = path[depth];

      const childHash = children[nibble];
      const newChildHash = await this.set(childHash, key, value, depth + 1);

      children[nibble] = newChildHash;

      const newBranch = new BranchNode(children);
      await this.db.put(newBranch);
      return newBranch.hash();
    }

    const leafNode = node as LeafNode;
    if (leafNode.key === key) {
      const newLeaf = new LeafNode(key, value);
      await this.db.put(newLeaf);
      return newLeaf.hash();
    }

    const oldPath = this.getHexPath(leafNode.key);
    let i = depth;
    while (i < path.length && i < oldPath.length && path[i] === oldPath[i]) {
      i++;
    }

    const currentBranchChildren = Array(16).fill(null);
    const existingLeaf = new LeafNode(leafNode.key, leafNode.value);
    await this.db.put(existingLeaf);
    currentBranchChildren[oldPath[i]] = existingLeaf.hash();

    const newLeaf = new LeafNode(key, value);
    await this.db.put(newLeaf);
    currentBranchChildren[path[i]] = newLeaf.hash();

    let branch = new BranchNode(currentBranchChildren);
    await this.db.put(branch);
    while (i > depth) {
      i--;
      const tempChildren = Array(16).fill(null);
      tempChildren[path[i]] = branch.hash();
      branch = new BranchNode(tempChildren);
      await this.db.put(branch);
    }

    return branch.hash();
  }

  async get(parent: Hash, key: string, depth: number = 0): Promise<number | null> {
    if (parent === this.EMPTY_TREE_ROOT) {
      return null;
    }

    const path = this.getHexPath(key);
    const node = await this.db.get(parent);
    if (!node) return null;
    if (node.type === NodeType.LEAF) {
      return (node as LeafNode).key === key ? (node as LeafNode).value : null;
    }
    if (depth >= path.length) return null;
    const nibble = path[depth];
    const childHash = (node as BranchNode).children[nibble];
    if (!childHash) return null;
    return this.get(childHash, key, depth + 1);
  }

  getHexPath(key: string): number[] {
    const hex = createHash("sha256").update(key).digest("hex");
    return hex.split("").map((c) => parseInt(c, 16));
  }

  /**
   * Debug utility function to visualize the tree structure
   * @param root Root hash of the tree to print
   * @param depth Current depth in the tree (for indentation)
   */
  async printTree(root: Hash | null, depth: number = 0) {
    if (!root || root === this.EMPTY_TREE_ROOT) {
      console.debug("Empty tree");
      return;
    }

    const indent = "  ".repeat(depth);
    const node = await this.db.get(root);

    if (!node) {
      console.debug(`${indent}Node not found: ${root}`);
      return;
    }

    if (node.type === NodeType.LEAF) {
      const leaf = node as LeafNode;
      console.debug(`${indent}Leaf: key=${leaf.key}, value=${leaf.value}`);
    } else {
      const branch = node as BranchNode;
      console.debug(`${indent}Branch:`);
      for (let i = 0; i < branch.children.length; i++) {
        if (branch.children[i]) {
          console.debug(`${indent}[${i}]:`);
          await this.printTree(branch.children[i], depth + 1);
        }
      }
    }
  }
}
