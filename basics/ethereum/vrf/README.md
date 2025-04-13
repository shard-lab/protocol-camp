# Chainlink VRF Lottery

This project demonstrates how to integrate Chainlink VRF (Verifiable Random Function) into a smart contract for generating provably fair random numbers.

## 1. Overview

Chainlink VRF is a provably fair and verifiable random number generator (RNG) that enables smart contracts to access random values without compromising security. This project implements a simple lottery system where:

1. Players can join the lottery by paying a fee
2. Chainlink VRF generates a random number
3. The random number determines if the player wins based on a configurable winning rate
4. Winners receive the accumulated prize pool

The lottery uses Chainlink VRF's direct funding method for simplicity, where each request is paid for directly by the contract.

## 2. Learning Objectives

**Chainlink VRF Integration**
- Learn how to integrate Chainlink VRF into smart contracts
- Understand the request-response pattern of VRF
- Implement callback handling for random number generation

## 3. Core Concepts

### 3.1 Chainlink VRF

Chainlink VRF works through a request-response pattern:

1. **Request Phase**
   - Contract sends a request for randomness to Chainlink VRF
   - Request includes callback gas limit and number of random words needed
   - Contract pays for the request using native token (ETH)

2. **Response Phase**
   - Chainlink VRF generates random number and cryptographic proof
   - VRF Coordinator calls back the contract with the random number
   - Contract processes the random number in the callback function

### 3.2 Lottery Contract Mechanics

The lottery operates under the following rules:

1. **Game Setup**
   - Contract owner sets the winning rate (0-10000, representing 0-100% with 2 decimal precision)
   - Players can join by paying the VRF request fee
   - Only one active request per player is allowed

2. **Winning Determination**
   - Random number from VRF is used to determine if player wins
   - Winning rate is configurable (e.g., 5000 = 50.00%)
   - If player wins, they receive the entire prize pool

3. **Prize Distribution**
   - Winners receive the entire accumulated prize pool
   - Prize pool consists of excess ETH from VRF requests
   - Contract automatically transfers prize to winner

## 4. Implementation Details

### 4.1 Contract Structure

```
.
├── src/
│   └── Lottery.sol    # Main lottery contract with VRF integration
├── test/
│   ├── Lottery.t.sol  # Foundry tests for the lottery contract
│   └── mocks/         # Mock contracts for testing
└── foundry.toml       # Foundry configuration
```

### 4.2 Core Components

1. **Lottery Contract (`src/Lottery.sol`)**
   - Inherits from `VRFV2PlusWrapperConsumerBase` for VRF integration
   - Manages player requests and winning rate
   - Handles prize distribution
   - Implements VRF callback function

2. **Test Suite (`test/Lottery.t.sol`)**
   - Tests contract initialization and configuration
   - Verifies VRF request and callback flow
   - Tests winning probability and prize distribution
   - Tests error conditions and edge cases

### 4.3 Key Functions

1. **join()**
   - Players call this function to participate
   - Calculates VRF request price
   - Sends request to Chainlink VRF
   - Tracks player's active request

2. **fulfillRandomWords()**
   - Callback function from Chainlink VRF
   - Processes random number
   - Determines if player wins
   - Distributes prize if player wins

3. **setWinningRate()**
   - Owner-only function to configure winning probability
   - Validates new rate is within valid range (0-10000)

## 5. Running Tests

```bash
# Install dependencies
forge install

# Run tests
forge test
```
