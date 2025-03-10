export interface LogicGate {
  evaluate(): boolean;
  toString(): string;
}

export class Leaf implements LogicGate {
  constructor(public readonly value: boolean) {}

  static true(): Leaf {
    return new Leaf(true);
  }

  static false(): Leaf {
    return new Leaf(false);
  }

  evaluate(): boolean {
    return this.value;
  }

  toString(): string {
    return this.value ? "1" : "0";
  }
}

export class NandNode implements LogicGate {
  constructor(
    public readonly left: LogicGate,
    public readonly right: LogicGate
  ) {}

  evaluate(): boolean {
    return !(this.left.evaluate() && this.right.evaluate());
  }

  toString(): string {
    return `NAND(${this.left.toString()}, ${this.right.toString()})`;
  }
}
