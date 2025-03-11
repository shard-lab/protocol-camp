# BitVM Protocol Implementation

This project is inspired by the BitVM paper, which introduced a novel way to enable complex computations on Bitcoin without requiring protocol changes.

Note: This Learning Module is a simple example implementation to help understand how BitVM works, with no additional modifications or implementations needed.

## 1. Overview

BitVM's core mechanism is beautifully simple yet powerful:

1. Any computation is first converted into a circuit of NAND gates
2. The prover commits to each NAND gate's inputs and outputs using hash-based preimages
3. The verifier randomly challenges individual gates, requesting their preimages
4. The prover reveals the preimages for challenged gates
5. The verifier checks that the preimages hash correctly and follow NAND logic
6. This challenge-response process repeats with different random gates
7. If all challenges pass, the computation is proven correct

This elegant verification system enables complex computations on Bitcoin without requiring protocol changes. It represents a significant advancement in Bitcoin's programmability by moving complex logic off-chain while maintaining on-chain verification of results.

Note: While this implementation demonstrates the core concepts in an off-chain setting for educational purposes, the actual BitVM protocol operates on-chain between two parties (like Lightning Network) who take turns issuing challenges and responses. This interactive verification process happens through Bitcoin transactions, making it truly trustless and decentralized.

To best understand this implementation, we recommend starting with `bitvm.test.ts`. This file contains practical examples showing how to prove mathematical relationships (like x + y = 7) using the BitVM protocol, demonstrating the transformation of arithmetic operations into NAND gate circuits.

## 2. Learning Objectives

1. Zero-Knowledge Proofs

   - Understand how to prove knowledge of values without revealing them
   - Learn how to convert arithmetic relationships into provable circuits

2. Bitcoin Protocol Extensions

   - Explore how complex computations can be done off-chain
   - See how results can be verified on-chain without protocol changes
   - Understand how two parties interact through Bitcoin transactions

3. Circuit Design
   - Learn how to express computations using NAND gates
   - Understand commitment schemes and interactive verification

## 3. Core Concepts

### 3.1 Core Mechanism

BitVM operates on two key principles:

1. **Off-chain Computation**: Complex computations are performed off the Bitcoin blockchain
2. **On-chain Verification**: The correctness of these computations is verified on-chain through a clever commitment scheme

For example, to prove that two numbers sum to 7 (x + y = 7):

1. The computation is first converted into a circuit of NAND gates
2. Each NAND gate's inputs and outputs are committed to using hash-based commitments
3. The verifier can challenge any gate to ensure the circuit is evaluated correctly

In the actual protocol, these challenges and responses are encoded in Bitcoin transactions between the two participating parties, creating a trustless verification system. However, for simplicity, this implementation demonstrates the logic off-chain.

### 3.2 Circuit Construction

Every computation in BitVM is expressed as a circuit of NAND gates. Here's how it works:

1. **Basic Building Block: NAND Gate**

   - A NAND gate takes two binary inputs and produces one output
   - Any computation can be expressed using only NAND gates
   - Example: For inputs A and B, output is !(A AND B)

2. **Converting Logic to Circuits**
   - Example: Adding two 4-bit numbers
   ```
   x = 0100 (4 in binary)
   y = 0011 (3 in binary)
   sum = 0111 (7 in binary)
   ```
   - This addition is broken down into multiple NAND gates
   - Each bit operation (AND, OR, XOR) is constructed from NAND gates

### 3.3 Commitment Scheme

The protocol uses a sophisticated commitment scheme:

1. **Hash-based Commitments**

   - For each wire in the circuit, two preimages are created (one for 0, one for 1)
   - The hash of these preimages forms the commitment
   - Example:
     ```
     preimage_0 = random_bytes()
     preimage_1 = random_bytes()
     commitment_0 = hash(preimage_0)
     commitment_1 = hash(preimage_1)
     ```

2. **Verification Process**
   - Verifier randomly challenges gates
   - Prover reveals relevant preimages
   - Verifier checks:
     - Preimages hash to correct commitments
     - NAND gate logic is satisfied
     - Consistency across connected gates

## 4. Implementation Details

### 4.1 Core Components

1. **Proof Structure**

   - Represents the entire circuit
   - Maintains commitment trees
   - Handles gate relationships and dependencies

2. **Prover (`src/bitvm.ts`)**

   - Creates and manages proof structure
   - Generates commitments
   - Responds to challenges with appropriate preimages

3. **Verifier (`src/bitvm.ts`)**
   - Issues random challenges
   - Verifies preimage revelations
   - Ensures circuit consistency

### 4.2 Protocol Flow

1. **Circuit Creation**

   ```typescript
   // Example from bitvm.test.ts
   const x: u4 = toBit4(4); // 4-bit representation
   const y: u4 = toBit4(3);
   const [sum, overflow] = add(x, y); // Creates NAND circuit
   ```

2. **Proof Generation**

   ```typescript
   const proof = new Proof(circuit);
   const prover = new Prover(proof);
   ```

3. **Interactive Verification**
   ```typescript
   const verifier = new Verifier(prover.taproot);
   const challenge = verifier.generateChallenge();
   const response = prover.challenge(challenge);
   ```

## 5. Running Tests

1. Install dependencies:
