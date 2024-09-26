import { proofOfWork } from "../src/pow";
import { createHash } from "crypto";
import { expect } from "chai";

describe("Proof of Work", () => {
  it("Find a valid nonce for the expected root", () => {
    const data = "Hello! Protocol Camp!!";
    const difficulty = 20; // 20 leading zero bits.

    const nonce = proofOfWork(data, difficulty);

    const hash = createHash("sha256")
      .update(data + nonce)
      .digest("hex");

    const expectedPrefix = "00000"; // 20 bits in binary = 5 zeros in hex

    expect(hash.startsWith(expectedPrefix)).to.be.true;
  });
});
