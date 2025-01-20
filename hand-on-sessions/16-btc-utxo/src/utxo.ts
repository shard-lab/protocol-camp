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
  public outputs: UTXO[];

  constructor(
    id: string,
    inputs: Array<{ txId: string; vOut: number }>,
    outputs: UTXO[]
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
    const outputs = outputsData.map((out, idx) => {
      return new UTXO(txId, idx, out.address, out.amount);
    });
    return new Transaction(txId, inputs, outputs);
  }
}

export class Node {
  public transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public getAllUTXOs(): UTXO[] {
    throw new Error("Implement me!");
  }

  public getUTXOs(address: string): UTXO[] {
    throw new Error("Implement me!");
  }

  public gatherInputs(sender: string, amount: number | Decimal): Array<{ txId: string; vOut: number }> {
    const amt = new Decimal(amount);
    const utxos = this.getUTXOs(sender);
    let collected = new Decimal(0);
    const inputs: Array<{ txId: string; vOut: number }> = [];

    // TODO - implements here!: collect enough UTXOs to cover the amount

    if (collected.lt(amt)) {
      throw new Error(`Insufficient funds for ${sender}`);
    }
    return inputs;
  }

  public createOutputs(
    sender: string,
    recipient: string,
    inputs: Array<{ txId: string; vOut: number }>,
    amount: number | Decimal
  ): Array<{ address: string; amount: Decimal }> {
    const amt = new Decimal(amount);
    let totalInput = new Decimal(0);
    const utxos = this.getAllUTXOs(); 
    const outputs: Array<{ address: string; amount: Decimal }> = [];
    // TODO: implements here!

    return outputs;
  }

  public validateTransaction(tx: Transaction) {
    const utxos = this.getAllUTXOs();
    const totalInput = tx.inputs.reduce((sum, i) => {
      const utxo = utxos.find((u) => u.txId === i.txId && u.vOut === i.vOut);
      if (!utxo) {
        throw new Error("Input not found or spent");
      }
      return sum.add(utxo.amount);
    }, new Decimal(0));

    const totalOutput = tx.outputs.reduce((sum, o) => sum.add(o.amount), new Decimal(0));

    if (totalInput.lt(totalOutput)) {
      throw new Error(`Transaction invalid: totalInput < totalOutput`);
    }
  }

  public executeTransaction(tx: Transaction) {
    this.transactions.push(tx);
  }

  public processTransaction(
    sender: string,
    recipient: string,
    amount: number | Decimal
  ): Transaction {
    const inputs = this.gatherInputs(sender, amount);
    const outputsData = this.createOutputs(sender, recipient, inputs, amount);
    const tx = Transaction.create(inputs, outputsData);
    this.validateTransaction(tx);
    this.executeTransaction(tx);
    return tx;
  }
}
