import { NOT, Leaf, LogicGate } from "../gate";
import { u4, fullAdd } from ".";

/**
 * Implements subtraction (x - y) using two's complement:
 *   x - y = x + (NOT(y) + 1)
 * Here, all bits are added at once using fullAdd(...)
 * (implements +1 by setting carryIn to 1)
 */
export function sub(x: u4, y: u4): [u4, LogicGate] {
  // Start with cin = Leaf.true() (i.e. 1) from the first bit
  // => x[0] + NOT(y[0]) + 1
  const [sum0, carry0] = fullAdd(x[0], NOT(y[0]), Leaf.true());
  const [sum1, carry1] = fullAdd(x[1], NOT(y[1]), carry0);
  const [sum2, carry2] = fullAdd(x[2], NOT(y[2]), carry1);
  const [sum3, carry3] = fullAdd(x[3], NOT(y[3]), carry2);

  // 4-bit result
  const result = [sum0, sum1, sum2, sum3] as u4;

  // carry3 is the final carry out
  // In two's complement:
  //   carry3 == 1  → "no borrow" (x >= y, result is positive/zero)
  //   carry3 == 0  → "borrow occurred" (x < y, result is negative)
  //
  // If a test wants to use "borrowBit == true" to mean "actually borrowed", take NOT(...)
  // Here we assume we return the raw carryOut
  const borrowBit = carry3; // or: const borrowBit = NOT(carry3);

  return [result, NOT(borrowBit)];
}
