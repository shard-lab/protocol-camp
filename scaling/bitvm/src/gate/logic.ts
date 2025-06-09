import { LogicGate, NandNode } from ".";

/** NOT(x) = NAND(x, x) */
export function NOT(a: LogicGate): LogicGate {
  return new NandNode(a, a);
}

/** AND(x, y) = NOT(NAND(x, y)) = NAND(NAND(x,y), NAND(x,y)) */
export function AND(a: LogicGate, b: LogicGate): LogicGate {
  const nand = new NandNode(a, b);
  return NOT(nand);
}

/** OR(x, y) = NAND(NOT(x), NOT(y)) = NAND(NAND(x,x), NAND(y,y)) */
export function OR(a: LogicGate, b: LogicGate): LogicGate {
  return new NandNode(NOT(a), NOT(b));
}

/** XOR(x, y) = (x AND NOT(y)) OR (NOT(x) AND y)
        All internal AND/OR/NOT operations are also composed of NAND gates */
export function XOR(a: LogicGate, b: LogicGate): LogicGate {
  const notA = NOT(a); // NAND(a, a) → NOT(A)
  const notB = NOT(b); // NAND(b, b) → NOT(B)

  const aAndNotB = new NandNode(a, notB); // NAND(A, NOT(B))
  const notAAndB = new NandNode(notA, b); // NAND(NOT(A), B)

  return new NandNode(aAndNotB, notAAndB); // NAND(NAND(A, NOT(B)), NAND(NOT(A), B))
}
