import { ethers, keccak256 } from "ethers";

export function proofOfWork(address: string): bigint {
  let nonce = 0n;
  const DIFFICULTY = 4n;
  const MAX_UINT256 = 2n ** 256n - 1n;
  let conditionMet = false;

  while (!conditionMet) {
    const hash = keccak256(
      ethers.solidityPacked(["address", "uint256"], [address, nonce])
    );

    const hashNum = BigInt(hash);

    if (hashNum <= MAX_UINT256 >> DIFFICULTY) {
      conditionMet = true;
      return nonce;
    }

    nonce++;
  }

  return 0n;
}
