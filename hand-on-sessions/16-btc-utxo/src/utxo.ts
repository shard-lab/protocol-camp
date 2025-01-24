import { Decimal } from "decimal.js";
import { randomUUID } from "crypto";

export class UTXO {
  public txId: string;
  public vOut: number;
  public address: string;
  public amount: Decimal;

  constructor(txId: string, vOut: number, address: string, amount: number | Decimal) {
    this.txId = txId;
    this.vOut = vOut;
    this.address = address;
    this.amount = new Decimal(amount);
  }
}

export class Transaction {
  public id: string;
  public inputs: Array<{ txId: string; vOut: number }>;
  public outputs: Array<{ address: string; amount: number | Decimal }>;

  constructor(
    id: string,
    inputs: Array<{ txId: string; vOut: number }>,
    outputs: Array<{ address: string; amount: number | Decimal }>
  ) {
    this.id = id;
    this.inputs = inputs;
    this.outputs = outputs;
  }

  static create(
    inputs: Array<{ txId: string; vOut: number }>,
    outputsData: Array<{ address: string; amount: number | Decimal }>
  ): Transaction {
    const txId = randomUUID();
    return new Transaction(txId, inputs, outputsData);
  }
}

export class Node {
  public transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public send(
    sender: string,
    recipient: string,
    amount: number | Decimal
  ): Transaction {
    const { inputs, outputs } = this.createTransaction(sender, recipient, amount);
    const tx = Transaction.create(inputs, outputs);
    this.verifyTransaction(tx);
    this.transactions.push(tx);
    return tx;
  }

  public getAllUTXOs(): UTXO[] {
    throw new Error("Implement me");
  }

  public getUTXOs(address: string): UTXO[] {
    return this.getAllUTXOs().filter((u) => u.address === address);
  } 

  private createTransaction(
    sender: string,
    recipient: string,
    amount: number | Decimal
  ): Transaction {
    throw new Error("Implement me");
  }

  private verifyTransaction(tx: Transaction) {
    const allUTXOs = this.getAllUTXOs();

    const totalInput = tx.inputs.reduce((sum, input) => {
      const utxo = allUTXOs.find(
        (u) => u.txId === input.txId && u.vOut === input.vOut
      );
      if (!utxo) {
        throw new Error("Input not found or already spent");
      }
      return sum.add(utxo.amount);
    }, new Decimal(0));

    const totalOutput = tx.outputs.reduce(
      (sum, o) => sum.add(new Decimal(o.amount)),
      new Decimal(0)
    );

    if (totalInput.lt(totalOutput)) {
      throw new Error(
        `Invalid transaction: totalInput < totalOutput`
      );
    }
  }
}
