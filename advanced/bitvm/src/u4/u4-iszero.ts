import { LogicGate, NOT, OR } from "../gate";
import { Leaf } from "../gate";
import { u4 } from "./u4";

export function isZero(bits: u4): LogicGate {
  return NOT(bits.reduce((acc: LogicGate, bit: LogicGate) => OR(acc, bit), Leaf.false()));
}
