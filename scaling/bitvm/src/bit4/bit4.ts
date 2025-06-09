/** 4-bit array: stored in [LSB, ..., MSB] order */
export type Bit4 = [boolean, boolean, boolean, boolean];

/** Utility for converting between 4-bit and number (0~15) */
export function toBit4(n: number): Bit4 {
  // 0 <= n <= 15
  return [
    Boolean(n & 1), // LSB
    Boolean(n & 2),
    Boolean(n & 4),
    Boolean(n & 8), // MSB
  ];
}

export function fromBit4(bits: Bit4): number {
  let n = 0;
  if (bits[0]) n |= 1;
  if (bits[1]) n |= 2;
  if (bits[2]) n |= 4;
  if (bits[3]) n |= 8;
  return n;
}
