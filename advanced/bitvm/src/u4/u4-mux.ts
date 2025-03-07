import { AND, LogicGate, NOT, OR, u4 } from ".";

/**
 * Multiplexes a single bit based on select signal
 * @param select Select signal (true selects a, false selects b)
 * @param a First input bit
 * @param b Second input bit
 * @returns Selected bit (a if select is true, b if select is false)
 */
function muxBit(select: LogicGate, a: LogicGate, b: LogicGate): LogicGate {
  const aSel = AND(a, select);
  const bNotSel = AND(b, NOT(select));
  return OR(aSel, bNotSel);
}

/** 4-bit multiplexer */
export function mux(select: LogicGate, a: u4, b: u4): u4 {
  return [
    muxBit(select, a[0], b[0]),
    muxBit(select, a[1], b[1]),
    muxBit(select, a[2], b[2]),
    muxBit(select, a[3], b[3]),
  ];
}
