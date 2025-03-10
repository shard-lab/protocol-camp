import { u4 } from ".";
import { AND, Leaf, LogicGate, NOT, OR, XOR } from "../gate";

/**
 * Compares two 4-bit numbers and returns whether x > y
 * @param x First 4-bit number [LSB,...,MSB]
 * @param y Second 4-bit number [LSB,...,MSB]
 * @returns LogicGate that evaluates to true if x > y, false otherwise
 */
export function gt(x: u4, y: u4): LogicGate {
  // Initialize result to false - will be set to true if x > y is found
  let res: LogicGate = new Leaf(false);
  // Track if bits have been equal so far, starting from MSB
  let eq: LogicGate = new Leaf(true);

  // Compare bits from MSB to LSB
  for (let i = 3; i >= 0; i--) {
    // Check if current bit of x is 1 and y is 0
    const gt = AND(x[i], NOT(y[i]));
    // x>y at this bit position only matters if all higher bits were equal
    const gtBit = AND(gt, eq);
    // Update result - true if we found x>y at any more significant bit
    res = OR(res, gtBit);
    // Check if current bits are equal (NOT of XOR)
    const eqBit = NOT(XOR(x[i], y[i]));
    // Update eq - true only if all bits so far have been equal
    eq = AND(eq, eqBit);
  }

  return res;
}
