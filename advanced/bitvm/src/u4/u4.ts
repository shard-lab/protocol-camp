import { Leaf, LogicGate } from "./gate";

/** 4-bit array: stored in [LSB, ..., MSB] order */
export type u4 = [LogicGate, LogicGate, LogicGate, LogicGate];

/** Utility for converting between 4-bit and number (0~15) */
export function toBit4(n: number): u4 {
  // 0 <= n <= 15
  return [
    new Leaf(Boolean(n & 1)), // LSB
    new Leaf(Boolean(n & 2)),
    new Leaf(Boolean(n & 4)),
    new Leaf(Boolean(n & 8)), // MSB
  ];
}

export function fromBit4(bits: u4): number {
  let n = 0;
  if (bits[0].evaluate()) n |= 1;
  if (bits[1].evaluate()) n |= 2;
  if (bits[2].evaluate()) n |= 4;
  if (bits[3].evaluate()) n |= 8;
  return n;
}
