import { expect } from "chai";
import { fetchJson } from "../src/fetch";
import { Prover } from "../src/prover";

/**
 * Test cases for Interactive Zero Knowledge Proof (Prover)
 *
 * This test verifies the prover's ability to generate valid proofs.
 * It tests the complete interactive proof protocol:
 * 1. Prover generates commitment value (v = g^r mod p)
 * 2. Sends v to verifier and receives challenge bit (b)
 * 3. Generates response based on challenge
 * 4. Sends response to verifier for validation
 *
 * The test runs 10 iterations to ensure protocol reliability.
 */
describe("#Interactive Zero Knowledge Proof(Prover)", () => {
  const G = 5; // Generator value
  const P = 23; // Prime modulus
  const X = 10; // Secret value that prover knows
  const URL = "https://czr7dmahme.execute-api.ap-northeast-2.amazonaws.com/izkp/verifier";

  it("should generate valid proofs with 10 times", async function () {
    // Increase timeout to 10 seconds
    this.timeout(10000);

    for (let i = 0; i < 10; i++) {
      // Step 1: Generate commitment
      // Create new prover instance with commitment v = g^r mod p
      const prover = Prover.generate(X, G, P);
      const v = prover.v;

      // Step 2: Get challenge from verifier
      // Send commitment v to verifier and receive challenge bit b
      const { b, session } = await fetchJson<{ b: number; session: string }>(
        `${URL}/chooseChallenge`,
        "POST",
        { v }
      );

      // Step 3: Generate response
      // Create response based on challenge bit:
      // If b=0, response = r
      // If b=1, response = (r + x) mod (p-1)
      const response = prover.challenge(b);

      // Step 4: Verify response
      // Send response to verifier for validation
      const { result } = await fetchJson<{ result: boolean }>(`${URL}/verify`, "POST", {
        session,
        response,
      });

      expect(result).to.be.true;
    }
  });
});
