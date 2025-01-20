import { Decimal } from 'decimal.js';

export class UTXO {
    public owner: string;
    public amount: Decimal;

    constructor(owner: string, amount: number | Decimal) {
        this.owner = owner;
        this.amount = typeof amount === 'number' ? new Decimal(amount) : amount;
    }
  }
  
  export class Wallet {
    public name: string;
    public utxos: UTXO[] = [];

    constructor(name: string, utxos: UTXO[] = []) {
        this.name = name;
        this.utxos = utxos;
    }

    public getBalance(): Decimal {
      return this.utxos.reduce((sum, utxo) => sum.add(utxo.amount), new Decimal(0));
    }
  }
  
  export class Transaction {
    public sender: Wallet;
    public recipient: Wallet;
    public amount: Decimal;
    public inputs: UTXO[] = [];
    public outputs: UTXO[] = [];
  
    constructor(
      sender: Wallet,
      recipient: Wallet,
      amount: number | Decimal
    ) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = typeof amount === 'number' ? new Decimal(amount) : amount;
    }

    public getTotalInputAmount(): Decimal {
      return this.inputs.reduce((sum, utxo) => sum.add(utxo.amount), new Decimal(0));
    }

    public getTotalOutputAmount(): Decimal {
      return this.outputs.reduce((sum, utxo) => sum.add(utxo.amount), new Decimal(0));
    }
  
    public collectInputs(): void {
        throw new Error("Implement me");
      }
    
    public validateTransaction(): void {
        const totalInput = this.getTotalInputAmount();
        if (totalInput.lt(this.amount)) {
            throw new Error("Insufficient funds");
        }
    }
  
    public createOutputs(): void {
        throw new Error("Implement me");
    }
  
    public applyTransaction(): void {
        this.sender.utxos = this.sender.utxos.filter(
            (utxo) => !this.inputs.includes(utxo)
        );

        for (const out of this.outputs) {
            if (out.owner === this.sender.name) {
            this.sender.utxos.push(out);
            } else if (out.owner === this.recipient.name) {
            this.recipient.utxos.push(out);
            }
        }
    }

    public execute(): void {
      this.collectInputs();
      this.validateTransaction();
      this.createOutputs();
      this.applyTransaction();
    }
  }
  