import { proofOfWork } from "../src/pow";
import { createHash } from "crypto";
import { expect } from "chai";

describe("#Proof of Work Hands-on Session", () => {
  it("should find a valid nonce for the expected root", () => {
    const data = "Hello! Protocol Camp!!";
    const difficulty = 20; // 20 leading zero bits.

    const nonce = proofOfWork(data, difficulty);

    const hash = createHash("sha256")
      .update(data + nonce)
      .digest("hex");

    const expectedPrefix = "00000"; // 20 bits in binary = 5 zeros in hex

    expect(hash.startsWith(expectedPrefix)).to.be.true;
  });

  it("should find a valid and more difficult nonce for the expected root", async function () {
    // @ts-ignore
    this.timeout(30000);
    const data = "Hello! Protocol Camp!!";
    const difficulty = 28; // 28 leading zero bits.

    const nonce = await proofOfWork(data, difficulty);

    const hash = createHash("sha256")
      .update(data + nonce)
      .digest("hex");

    const expectedPrefix = "0000000"; // 28 bits in binary = 7 zeros in hex

    expect(hash.startsWith(expectedPrefix)).to.be.true;
  });
});
