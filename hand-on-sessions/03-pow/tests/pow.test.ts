import { ethers, keccak256 } from "ethers";
import { proofOfWork } from "../src/pow";

describe("PoW", () => {
  const privateKey =
    "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const address = "0xFCAd0B19bB29D4674531d6f115237E16AfCE377c";
  const DIFFICULTY = 24n;
  const MAX_UINT256 = 2n ** 256n - 1n;

  test("find a proof of work", async () => {
    const proof = proofOfWork(address);

    const hash = keccak256(
      ethers.solidityPacked(["address", "uint256"], [address, proof])
    );

    const hashNum = BigInt(hash);
    expect(hashNum <= MAX_UINT256 >> DIFFICULTY).toBe(true);
  });
});
