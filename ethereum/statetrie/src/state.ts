import { HexaTree, Hash } from "./hexatree";
import { Address, Transaction, TransactionReceipt } from "./types";

export class State {
  private trie: HexaTree;
  private root: Hash;
  private journal: Map<Address, number>;

  constructor(root: Hash, trie: HexaTree) {
    this.root = root;
    this.trie = trie;
    this.journal = new Map();
  }

  getRoot(): Hash {
    return this.root;
  }

  async getBalance(address: Address): Promise<number> {
    const key = address.toString();
    if (this.journal.has(key)) {
      return this.journal.get(key)!;
    }
    return (await this.trie.get(this.root, key)) ?? 0;
  }

  async apply(transactions: Transaction[]): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = [];
    for (const tx of transactions) {
      const fromBal = await this.getBalance(tx.from);
      const toBal = await this.getBalance(tx.to);

      if (fromBal < tx.value) {
        receipts.push({
          status: 0,
          reason: "insufficient balance",
        });
        continue;
      }

      this.journal.set(tx.from, fromBal - tx.value);
      this.journal.set(tx.to, toBal + tx.value);
      receipts.push({ status: 1 });
    }

    return receipts;
  }

  async commit(): Promise<Hash> {
    let newRoot = this.root;
    for (const [key, value] of this.journal) {
      newRoot = await this.trie.set(newRoot, key, value);
    }
    this.root = newRoot;
    this.journal.clear();
    return this.root;
  }

  revert() {
    this.journal.clear();
  }
}
