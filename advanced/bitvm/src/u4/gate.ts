export interface LogicGate {
  evaluate(): boolean;
  toString(): string;
}

export class Leaf implements LogicGate {
  constructor(private readonly value: boolean) {}

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
    private readonly left: LogicGate,
    private readonly right: LogicGate
  ) {}

  evaluate(): boolean {
    // NAND = NOT(A && B)
    return !(this.left.evaluate() && this.right.evaluate());
  }

  toString(): string {
    return `NAND(${this.left.toString()}, ${this.right.toString()})`;
  }
}

/** NOT(x) = NAND(x, x) */
export function NOT(a: LogicGate): LogicGate {
  return new NandNode(a, a);
}

/** AND(x, y) = NOT(NAND(x, y)) = NAND(NAND(x,y), NAND(x,y)) */
export function AND(a: LogicGate, b: LogicGate): LogicGate {
  const nandVal = new NandNode(a, b);
  return new NandNode(nandVal, nandVal);
}

/** OR(x, y) = NAND(NOT(x), NOT(y)) = NAND(NAND(x,x), NAND(y,y)) */
export function OR(a: LogicGate, b: LogicGate): LogicGate {
  let notA = new NandNode(a, a);
  let notB = new NandNode(b, b);
  return new NandNode(notA, notB);
}

/** XOR(x, y) = (x AND NOT(y)) OR (NOT(x) AND y)
      All internal AND/OR/NOT operations are also composed of NAND gates */
export function XOR(a: LogicGate, b: LogicGate): LogicGate {
  let x_and_noty = AND(a, NOT(b));
  let notx_and_y = AND(NOT(a), b);
  return OR(x_and_noty, notx_and_y);
}
