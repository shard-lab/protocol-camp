import { proofOfWork } from "../src/pow";

describe("Proof of Work", () => {
  test("Find a valid nonce for the expected root", () => {
    const data = "Hello! Protocol Camp!!";
    const difficulty = 20; // 20 leading zero bits. The number of leading zero bits the hash must have. It should be between 0 and 256.

    const nonce = proofOfWork(data, difficulty);

    const hash = require("crypto")
      .createHash("sha256")
      .update(data + nonce)
      .digest("hex");

    const expectedPrefix = "00000"; // 20 bits in binary = 5 zeros in hex

    expect(hash.startsWith(expectedPrefix)).toBe(true);
  });
});
