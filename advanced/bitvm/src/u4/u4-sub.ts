import { NOT, Leaf, LogicGate } from "./gate";
import { u4, fullAdd } from ".";

/**
 * 뺄셈(x - y)을 2의 보수 방식으로 구현:
 *   x - y = x + (NOT(y) + 1)
 * 여기서 각 비트를 fullAdd(...)로 한 번에 더함
 * (carryIn을 1로 줘서 +1을 구현)
 */
export function sub(x: u4, y: u4): [u4, LogicGate] {
  // 첫 비트에서부터 cin = Leaf.true() (즉, 1) 로 시작
  // => x[0] + NOT(y[0]) + 1
  const [sum0, carry0] = fullAdd(x[0], NOT(y[0]), Leaf.true());
  const [sum1, carry1] = fullAdd(x[1], NOT(y[1]), carry0);
  const [sum2, carry2] = fullAdd(x[2], NOT(y[2]), carry1);
  const [sum3, carry3] = fullAdd(x[3], NOT(y[3]), carry2);

  // 4비트 결과
  const result = [sum0, sum1, sum2, sum3] as u4;

  // carry3가 최종 캐리 아웃
  // 2의 보수에서:
  //   carry3 == 1  → "borrow 없음" (x >= y, 결과는 양수/0)
  //   carry3 == 0  → "borrow 발생" (x < y, 결과는 음수)
  //
  // 만약 테스트가 "borrowBit == true"를 "진짜 빌려왔다"라고 쓰고 싶다면 NOT(...)을 취한다.
  // 여기서는 "raw carryOut" 그대로 리턴한다고 가정
  const borrowBit = carry3; // or: const borrowBit = NOT(carry3);

  return [result, NOT(borrowBit)];
}
