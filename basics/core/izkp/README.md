# Zero-Knowledge Proof Implementation

## 1. Overview

This repository implements an interactive Zero-Knowledge Proof protocol where a Prover convinces a Verifier that they know a secret value x satisfying y = g^x mod p, through a series of API interactions.

## 2. Learning Objectives

1. Zero-Knowledge Proofs

   - Understand the concept of proving knowledge of a secret without revealing the secret itself.
   - See how a prover can convince a verifier about knowledge while maintaining privacy.

2. Interactive Protocol

   - Explore how the prover and verifier interact in a series of steps to establish the proof.
   - Understand the role of challenges and responses in the protocol.
   - Learn about commitment schemes and how they enable zero-knowledge properties.
   - See how randomness helps ensure security of the protocol.

3. Educational Simplification

   - Recognize that real-world implementations may involve complex cryptographic primitives.
   - Here, we focus on the basic protocol to keep things clear and educational.
   - Learn the core concepts without getting lost in implementation details.
   - For simplicity, we use small numbers that can be handled by JavaScript's number type.

## 3. Core Concepts

### 3.1 Variables and Equations

#### Core Variables

- P: A large prime number (modulus)
- G: Generator of the multiplicative group modulo P
- **X**: **Secret value known only to the Prover**
- Y: Public value, where Y = G^X mod P
- R: Random value chosen by Prover for each proof
- V: Commitment value, where V = G^R mod P
- B: Challenge bit (0 or 1) chosen by Verifier
- Response: Value sent by Prover based on challenge:
  - If B = 0: Response = R
  - If B = 1: Response = (R + X) mod (P-1)
- **Session**: **A unique identifier to maintain stateless context between interactions**
  - Helps track random value R across multiple API calls
  - Ensures protocol integrity by binding commitment and response phases

#### Key Equations

1. Public Setup:
   Y ≡ G^X mod P

2. Commitment Phase:
   V ≡ G^R mod P

3. Response Phase:
   - For B = 0: Verifier checks G^Response ≡ V mod P
   - For B = 1: Verifier checks G^Response ≡ V \* Y mod P

### 3.2 Implementation Structure

1. Prover (`src/prover.ts`)

   - Holds the secret value x
   - Interacts with Verifier's API
   - Methods:
     - `generate()`: Generates and returns commitment v = g^r mod p
     - `challenge(challenge)`: Calculates response based on verifier's challenge

2. Verifier (`src/verifier.ts`)
   - Validates proofs without learning x
   - Interacts with Prover's API
   - Methods:
     - `chooseChallenge()`: Randomly selects b ∈ {0,1}
     - `verify(b, v, response, params)`: Verifies the proof

### 3.3 Interactive Protocol Flow

1. Prover → Verifier:

   - Prover generates random r
   - Sends commitment v = g^r mod p
   - Receives session ID to track this proof attempt

2. Verifier → Prover:

   - Verifier generates random challenge b
   - Sends b to Prover along with session ID
   - Session ensures challenge corresponds to original commitment

3. Prover → Verifier:
   - If b = 0: sends response = r with session ID
   - If b = 1: sends response = (r + X) % (P - 1) with session ID
   - Session guarantees response matches the commitment's random value r
   - Verifier checks validity

## 4. Running Tests

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm run test
```
