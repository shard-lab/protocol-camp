import { Hash, TrieNode } from "./hexatree";

export interface KVDB {
  get(hash: Hash): Promise<TrieNode | undefined>;
  put(node: TrieNode): Promise<Hash>;
}

export class MemoryKVDB implements KVDB {
  private db: Map<Hash, TrieNode>;

  constructor() {
    this.db = new Map();
  }

  async get(hash: Hash): Promise<TrieNode | undefined> {
    return this.db.get(hash);
  }
  async put(node: TrieNode): Promise<Hash> {
    const h = node.hash();
    this.db.set(h, node);
    return h;
  }
}
