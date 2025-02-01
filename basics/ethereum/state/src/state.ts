export interface Transaction {
  from: string;
  to: string;
  value: number;
}

export class State {
  private committedState: Map<string, number>;
  private cache: Map<string, number>;

  constructor(initialState: Map<string, number>) {
    this.committedState = new Map(initialState);
    this.cache = new Map();
  }

  apply(transaction: Transaction): void {
    const fromBalance = this._getBalance(transaction.from);
    const toBalance = this._getBalance(transaction.to);

    if (fromBalance < transaction.value) {
      throw new Error("Insufficient balance");
    }

    this.cache.set(transaction.from, fromBalance - transaction.value);
    this.cache.set(transaction.to, toBalance + transaction.value);
  }

  commit(): void {
    this.cache.forEach((value, key) => {
      this.committedState.set(key, value);
    });
    this.cache.clear();
  }

  revert(): void {
    this.cache.clear();
  }

  getBalance(address: string): number {
    return this._getBalance(address);
  }

  getCommittedState(): Map<string, number> {
    return this.committedState;
  }

  private _getBalance(address: string): number {
    if (this.cache.has(address)) {
      return this.cache.get(address)!;
    }

    const committedBalance = this.committedState.get(address) || 0;
    this.cache.set(address, committedBalance);
    return committedBalance;
  }
}
