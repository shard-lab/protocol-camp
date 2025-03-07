import { XOR, OR, AND, LogicGate, Leaf } from "./gate";
import { u4 } from "./u4";

/**
 * Half adder: adds two bits and returns sum and carry
 * @param a First input bit
 * @param b Second input bit
 * @returns [sum, carry] tuple where sum is XOR(a,b) and carry is AND(a,b)
 */
function halfAdd(a: LogicGate, b: LogicGate): [LogicGate, LogicGate] {
  const sum = XOR(a, b);
  const carry = AND(a, b);
  return [sum, carry];
}

/**
 * Full adder: adds three bits (a, b, carry-in) and returns sum and carry-out
 * @param a First input bit
 * @param b Second input bit
 * @param cin Carry-in bit from previous stage
 * @returns [sum, carry-out] tuple
 */
export function fullAdd(a: LogicGate, b: LogicGate, cin: LogicGate): [LogicGate, LogicGate] {
  const [sum1, carry1] = halfAdd(a, b);
  const [sum2, carry2] = halfAdd(sum1, cin);
  const carryOut = OR(carry1, carry2);
  return [sum2, carryOut];
}

/**
 * 4-bit adder: adds two 4-bit numbers
 * @param x First 4-bit number [LSB,...,MSB]
 * @param y Second 4-bit number [LSB,...,MSB]
 * @returns [sum, overflow] where sum is 4-bit result and overflow indicates if result exceeded 4 bits
 * @throws Error if result exceeds 4 bits (>15)
 */
export function add(x: u4, y: u4): [u4, LogicGate] {
  const [sum0, carry0] = fullAdd(x[0], y[0], new Leaf(false));
  const [sum1, carry1] = fullAdd(x[1], y[1], carry0);
  const [sum2, carry2] = fullAdd(x[2], y[2], carry1);
  const [sum3, carry3] = fullAdd(x[3], y[3], carry2);
  const result = [sum0, sum1, sum2, sum3] as u4;
  return [result, carry3];
}
