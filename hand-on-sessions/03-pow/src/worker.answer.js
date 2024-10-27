// workerFunction.js
const { createHash } = require("crypto");
const workerpool = require("workerpool");

function workerFunction(data, difficulty, startNonce, endNonce) {
  const target = BigInt(1) << BigInt(256 - difficulty);

  for (let nonce = startNonce; nonce < endNonce; nonce++) {
    const hash = createHash("sha256")
      .update(data + nonce)
      .digest("hex");
    const hashValue = BigInt("0x" + hash);

    if (hashValue < target) {
      return nonce;
    }
  }

  throw new Error("Nonce not found in the given range");
}

workerpool.worker({
  workerFunction,
});
