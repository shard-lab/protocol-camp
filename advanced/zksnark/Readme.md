# zk-SNARK Implementation (Groth16-style) in TypeScript

This Learning Module is a simple example implementation of a zk-SNARK proof system to help understand how zk-SNARKs work, with no additional modifications or implementations needed.

> **Prerequisites**: To better understand this module, it is recommended to first complete:
>
> - `basics/core/izkp`: Understanding interactive-zero-knowledge proofs
> - Basic understanding of elliptic curve cryptography
> - Familiarity with polynomial arithmetic and finite fields

<br>

## 1. Overview

Imagine you're trying to prove that you know the answer to a puzzle — but you don't want to reveal what the answer actually is.
Zero-Knowledge Proof (ZKP) lets you do exactly that: you can convince someone that you do know the answer, without giving away any hints about what it is.

zk-SNARK stands for Zero-Knowledge Succinct Non-Interactive Argument of Knowledge.
It solves three key problems:

- Succinct: The proof is tiny — no matter how complex the original problem was.
- Non-interactive: You don't need multiple rounds of communication; one message is enough.
- Zero-knowledge: Still no information is leaked beyond the fact that your claim is true.

This project is a complete educational implementation of a zk-SNARK proof system from scratch using the **BLS12-381 curve** and **Quadratic Arithmetic Programs (QAPs)**.  
It follows the Groth16 structure — converting R1CS constraints into polynomial form, generating a trusted setup (CRS), producing zk-proofs, and verifying them using pairing-based cryptography.

The codebase is written entirely in **TypeScript** and focuses on clarity, modularity, and adherence to cryptographic foundations.

<br>

## 2. Learning Objectives

- Understand how computation is modeled and encoded using R1CS and QAP
- Learn how to construct zk-proofs using polynomial commitments and Lagrange interpolation
- Explore the trusted setup phase and how it enables zero-knowledge
- Verify zk-proofs efficiently using pairing-based cryptography
- Grasp the overall structure and intuition behind Groth16 zk-SNARKs

<br>

## 3. Core Concepts

### 3.1 R1CS (Rank-1 Constraint System)

R1CS is a way to represent computations as algebraic constraints. It breaks down a complex computation — like a program or equation — into simple components involving only multiplication and addition.

To prove that a computation was done correctly, we need a formal description of what that computation is. R1CS serves as this blueprint by defining the constraints that any valid solution must satisfy.

Importantly, R1CS represents each constraint in the form of a multiplication equation:

```
(A · w) * (B · w) = (C · w)
```

This format is not arbitrary — it’s specifically designed to handle multiplications between variables. Additions can be embedded into the linear combinations A, B, and C, but multiplication must be made explicit. That’s why every constraint must fit this structure.

For example, suppose we want to prove that we know two numbers `x` and `y` such that:

```
x + y = 10
```

R1CS reformulates this as:

```
(x + y) * 1 = z
```

**Variables (Witness vector):**

```
w = [1, x, y, z]   // w₀ = constant 1
    [w₀, w₁, w₂, w₃]
```

**R1CS Constraint:**

- A = [0, 1, 1, 0] → selects `x + y`
- B = [1, 0, 0, 0] → selects constant `1`
- C = [0, 0, 0, 1] → selects `z`

Which gives:

```
(A · w) * (B · w) = (C · w)
=> (x + y) * 1 = z ✅
```

### 3.2 QAP (Quadratic Arithmetic Program)

Once a computation is expressed as an R1CS — a set of multiplication constraints — the next step is to convert those constraints into polynomials. This is what QAP does.

Why polynomials?
Polynomials allow us to represent many constraints all at once, and they give us a neat trick:

> If a polynomial has certain values at certain points, then we can "compress" all those checks into one.

How does it work?
Let’s say we have 3 constraints. We can assign each constraint to a number — like position 1, 2, and 3 on the x-axis. We then build a big polynomial P(x) that captures whether each constraint is satisfied at those positions.

If all the constraints are satisfied, then:

```
P(1) = 0
P(2) = 0
P(3) = 0
```

This means:

> P(x) has (x - 1), (x - 2), and (x - 3) as factors.

So we define a target polynomial:

```
t(x) = (x - 1)(x - 2)(x - 3)
```

And if `P(x)` is divisible by `t(x)`, then we know all constraints are satisfied.

So why check at just one point?
Checking full polynomial division is slow.
Instead, we choose one secret random number τ, and check whether:

```
P(τ) is divisible by t(τ)
```

If the prover doesn't know τ in advance, they can't cheat — even though you're only checking at one point.
It’s like asking: "If you really did your homework right, then plug in this secret number and prove it still works." If they’re lying, it’ll almost certainly fail at τ.

And if it passes, there's a very high chance all constraints were truly satisfied.

The R1CS is transformed into a set of polynomials:

- u₁(x), ..., uₙ(x) ← from matrix A
- v₁(x), ..., vₙ(x) ← from matrix B
- w₁(x), ..., wₙ(x) ← from matrix C

With a target polynomial:

```
t(x) = (x - 1)(x - 2)...(x - m)
```

Final output of QAP
After the transformation, the entire computation is represented by a single equation:

```
(u(x) · v(x) - w(x)) = h(x) · t(x)
```

Here:

- u(x), v(x), w(x) are linear combinations of the witness vector.
- t(x) is the vanishing polynomial (based on constraint positions).
- h(x) is a new polynomial that "absorbs" the division.

In R1CS, constraints are tied to fixed indices like x = 1, 2, 3.
But in QAP, x becomes a symbolic variable — meaning we can evaluate the entire system at any point, not just those fixed positions.
This shift is what enables the verifier to check correctness using a single secret value τ

### 3.3 Trusted Setup (CRS)

Using a secret τ, the prover and verifier share commitments to:

- uᵢ(τ), vᵢ(τ), wᵢ(τ)
- τ⁰, τ¹, ..., τᵈ (for H(x) commitment)
- t(τ)

This phase produces the **Common Reference String (CRS)**, assumed to be securely generated.

### 3.4 Proof Generation

Once the computation is encoded as a QAP, the prover's goal is to generate a short proof that they know a valid witness — without revealing it — and that the QAP identity holds at a hidden point τ.

The process has three main steps:

1.Compute QAP Polynomials from the Witness
Given a valid witness w = [w₁, w₂, ..., wₙ], the prover computes:

- A(x) = Σ wᵢ · uᵢ(x)

- B(x) = Σ wᵢ · vᵢ(x)

- C(x) = Σ wᵢ · wᵢ(x)

These polynomials represent the prover’s assignment plugged into the QAP constraint system.

The prover then computes:

```
H(x) = (A(x) · B(x) - C(x)) / t(x)
```

This works only if the QAP identity holds — i.e., all constraints are satisfied.

2.Evaluate and Commit Using the CRS

The prover doesn’t know the secret value τ, but the trusted setup provides a Common Reference String (CRS) — a set of elliptic curve group elements that allows the prover to evaluate polynomials at τ in the exponent, without knowing τ itself.

Instead of revealing the actual values (which would leak the witness), the prover commits to the evaluations using group operations:

- A = [A(τ)] ∈ G1

- B = [B(τ)] ∈ G2

- C = [C(τ)] ∈ G1

- H = [H(τ)] ∈ G1

These are elliptic curve points derived using the CRS powers of τ (e.g., [1]\_G1, [τ]\_G1, [τ²]\_G1, ...).

This commitment scheme ensures that:

- The witness remains hidden, since the prover only sends encrypted group elements.

- The structure of the polynomials is preserved, so the verifier can later check whether the QAP identity holds — using pairings, without ever seeing the actual witness or τ.

  3.Output the zk-SNARK Proof
  The prover returns the final proof:

```
{
  A: PointG1,   // commitment to A(τ)
  B: PointG2,   // commitment to B(τ)
  C: PointG1,   // commitment to C(τ)
  H: PointG1    // commitment to H(τ)
}
```

Each element is a group commitment that encodes the prover's polynomial evaluations at τ, without revealing the witness or the polynomials themselves.

### 3.5 Proof Verification

Once the prover submits a proof { A, B, C, H }, the verifier checks whether it is valid — without learning the witness or the secret value τ.

This is done by verifying a single pairing equation:

```
e(A, B) == e(C, G₂) * e(H, T)
```

Where:

- e(·,·) is a bilinear pairing function between elliptic curve groups,
- G₂ is a generator of the group G2 (from the CRS),
- T is the CRS commitment to t(τ) in G2 (i.e., [t(τ)] ∈ G2).

What this equation checks

This pairing check is a cryptographic translation of the core QAP identity:

```
A(τ) · B(τ) - C(τ) = H(τ) · t(τ)
```

The verifier doesn’t know the values of A(τ), B(τ), C(τ), or H(τ),
but can still confirm this relation by operating on the group-encoded commitments using pairings.

If the equation holds, the verifier accepts the proof as valid — meaning the prover must know a valid witness that satisfies the original computation.

> Note: Where are α, β, γ?
>
> For simplicity, this example uses a minimal form of Groth16 — omitting the use of α, β, and γ in the CRS and proof.

However, in a real zk-SNARK system:

- α, β, γ are random toxic waste values generated during the trusted setup,
- They are used to construct stronger commitment structures in the CRS,
- These elements are essential for soundness — to prevent cheating provers from forging invalid proofs that still pass verification.

In the full Groth16 protocol, the proof and verification equation involve additional terms like:

```
e(αA + βB, γG₂) == e(C, G₂) · e(H, T)
```

These extensions prevent the prover from exploiting linearity in the polynomials and forging valid-looking proofs.

<br>

## 4. Implementation Details

The implementation follows the concepts explained above. Here's a guide to the key files:

### 4.1 Entry Point: zksnark.test.ts

The test file demonstrates the complete flow of creating and verifying a zk-SNARK proof:

1. Setting up the arithmetic circuit and QAP
2. Generating the trusted setup (CRS)
3. Creating a proof
4. Verifying the proof

### 4.2 Key Components

- **Circuit Definition**: The arithmetic circuit is defined using constraints that capture the computation we want to prove
- **QAP Generation**: Converts circuit constraints into Quadratic Arithmetic Program polynomials
- **Trusted Setup**: Creates the Common Reference String (CRS) with powers of a secret τ
- **Prover**: Evaluates polynomials and creates commitments using the CRS
- **Verifier**: Checks the proof using pairing operations

### 4.3 Dependencies

The implementation uses:

- `@noble/bls12-381`: For elliptic curve operations on BLS12-381 curve

## 5. Running Tests

1. Install dependencies:

```bash
npm install
```

2. Run tests:

```bash
npm run test
```
