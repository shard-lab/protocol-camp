import { expect } from "chai";
import { fetchJson } from "../src/fetch";
import { Verifier } from "../src/verifier";

/**
 * Test cases for Interactive Zero Knowledge Proof (Verifier)
 *
 * This test verifies the verifier's ability to validate proofs from a prover.
 * It tests the complete interactive proof protocol:
 * 1. Getting commitment value (v) from prover
 * 2. Generating random challenge bit (b)
 * 3. Receiving prover's response to the challenge
 * 4. Verifying the response is valid
 *
 * The test runs 10 iterations to ensure protocol reliability.
 */

describe("#Interactive Zero Knowledge Proof(Verifier)", () => {
  const G = 5;
  const P = 23;
  const Y = 8;
  const URL = "https://czr7dmahme.execute-api.ap-northeast-2.amazonaws.com/izkp/prover";

  it("should verify the proof with 10 times", async function () {
    // Increase timeout to 10 seconds
    this.timeout(10000);

    const verifier = new Verifier();

    for (let i = 0; i < 10; i++) {
      // Step 1: generate v
      // Get v = g^r mod p from server (r is randomly chosen by server)
      const gdata = await fetchJson<{ v: number; session: string }>(`${URL}/generate`, "POST");
      const { v, session } = gdata;

      // Step 2: choose random b challenge
      // Verifier randomly selects challenge b as either 0 or 1
      const b = verifier.chooseChallenge();

      // Step 3: send challenge to server
      // Send challenge b to server and receive response
      // When b=0, response = r
      // When b=1, response = (r + X) mod (p-1) (X is server's secret value)
      const cdata = await fetchJson<{ response: number }>(`${URL}/challenge`, "POST", {
        b,
        session,
      });

      // Step 4: verify response
      const response = cdata.response;
      const isValid = verifier.verify(b, v, response, { g: G, p: P, y: Y });
      expect(isValid).to.be.true;
    }
  });
});
