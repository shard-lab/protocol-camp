# MEV Challenge Project

This project offers a hands-on approach to understanding Maximal Extractable Value (MEV) concepts by implementing a bot that competes to be the N-th caller of a smart contract function.

## 1. Overview

MEV (Maximal Extractable Value) refers to the value that can be extracted from the blockchain beyond the standard block rewards and gas fees by reordering, including, or excluding transactions within blocks. This challenge simulates a specific MEV opportunity: the competition to be the N-th caller of a smart contract function to win a reward.

The core mechanism works as follows:

1. A smart contract (`Caller.sol`) maintains a counter for participant calls
2. Each round has a random target position (N)
3. The participant who hits the exact N-th position wins the reward (1 ETH)
4. Bots monitor the mempool and blockchain state to optimize their participation strategy
5. Success depends on timing, gas price optimization, and mempool monitoring

This challenge lets you experience real MEV competition in a controlled environment. You'll implement a bot that competes against other bots with basic random strategies, giving you an opportunity to apply advanced MEV techniques in a practical setting.

## 2. Learning Objectives

1. **Mempool Monitoring**
   - Learn to subscribe to and analyze pending transactions
   - Understand how to track transaction gas prices and timing
   - Develop methods to predict transaction ordering

2. **Blockchain State Monitoring**
   - Monitor new blocks and state changes in real-time
   - Process and react to on-chain events
   - Maintain accurate local state representations

3. **Transaction Optimization**
   - Implement gas price strategies to outbid competitors
   - Calculate optimal transaction timing
   - Develop reconnection logic for reliable WebSocket connections

4. **MEV Strategy Development**
   - Apply game theory to maximize win probability
   - Balance risk and reward in transaction submissions
   - Implement defensive measures against competitor strategies

## 3. Core Concepts

### 3.1 Game Rules and Mechanics

The Nth Caller Game operates under the following rules:

1. **Round Initialization**
   - Each round begins with a call to `startNewRound(uint256 _targetN)` by the contract owner
   - The owner provides 1 ETH as a reward for the winner
   - The target position N is randomly chosen between 3 and 10
   - A `RoundStarted` event is emitted with round number, target N, and reward amount

2. **Participation Process**
   - Players call the `participate()` function to compete
   - Each call increments a counter (`currentCount`) tracking the number of participants
   - The contract records each participant's position in the current round
   - A `Participated` event is emitted with round number, participant address, and position

3. **Winning Conditions**
   - When a participant makes the N-th call (when `currentCount == targetN`), they win
   - The round immediately ends when the winning call is made
   - The 1 ETH reward is automatically transferred to the winner
   - A `WinnerSelected` event is emitted with round number, winner address, and reward amount

4. **Round Management**
   - Only one round can be active at a time
   - The contract owner cannot participate in rounds
   - If a round is taking too long, the owner can force-end it using `forceEndRound()`
   - When a round ends (either by winner or force-end), a new round must be started manually
   - Players can view current round information using `getRoundInfo()`

5. **Position Tracking**
   - The contract tracks all positions of each participant in a round
   - Players can participate multiple times in the same round
   - Each participant's last position is recorded for quick access
   - Historical data for all rounds is maintained on-chain

### 3.2 Nth Caller Game Mechanism

The core game operates on a simple yet challenging principle:

1. **Round Structure**
   - Each round has a randomly chosen target position N (between 3-10)
   - Participants call the `participate()` function on the contract
   - The counter increments with each call
   - When the N-th call is received, the round ends and the caller wins

2. **Reward Mechanism**
   - Each round is funded with 1 ETH
   - The N-th caller receives the entire reward
   - A new round starts automatically after a winner is selected

3. **Participation Rules**
   - Each address can participate multiple times in a round
   - The contract owner cannot participate
   - Rounds can be force-ended by the owner if they run too long

### 3.3 Mempool Monitoring

Successful MEV strategies rely on effective mempool monitoring:

1. **Pending Transaction Subscription**
   - WebSocket connections monitor new pending transactions
   - Transactions to the target contract are filtered and analyzed
   - Gas prices and probable execution order are tracked

2. **Strategic Information**
   - Other participants' submissions reveal their strategies
   - Gas price trends indicate competition intensity
   - Transaction timing patterns can be identified and exploited

### 3.4 Transaction Optimization

Optimizing transactions is critical to winning the competition:

1. **Gas Price Strategy**
   - Higher gas prices increase the chance of being processed earlier
   - Incrementing competitor gas prices by a minimal amount maximizes efficiency
   - Setting appropriate upper bounds prevents excessive cost

2. **Timing Strategy**
   - Submitting transactions at strategic points in block time
   - Waiting for an optimal number of pending participate calls
   - Reacting quickly to new rounds or state changes

## 4. Implementation Details

### 4.1 Package Structure

```
.
├── docker/            # Docker configuration for running the project
├── logs/              # Log outputs from the bots and game manager
├── scripts/ts/src/    # TypeScript source code
│   ├── config.ts      # Configuration values and settings
│   ├── caller-bot.ts  # Basic bot implementation with random timing
│   ├── game-manager.ts # Manages the rounds of the competition
│   └── utils.ts       # Utility functions and helpers
├── shared/            # Shared data between containers
├── foundry/           # Solidity smart contracts and Foundry project
│   └── Caller.sol     # The smart contract for the MEV competition
│   └── Deploy.s.sol   # Script to deploy the Caller contract
│   └── foundry.toml   # Foundry configuration file
├── index.ts           # Advanced MEV bot implementation (main challenge file)
├── docker-compose.yml # Docker compose configuration
├── setup.sh           # Setup script to prepare and run the project
└── README.md          # Project documentation
```

### 4.2 Core Components

1. **Smart Contract (`foundry/Caller.sol`)**
   - Manages round state and participant counting
   - Handles reward distribution
   - Emits events for round lifecycle
   - `participate()`: Function that participants call to compete
   - Round state management (tracking the current count of participants)
   - Target position (N) that participants try to hit
   - Winner selection logic when the N-th position is reached
   - Reward distribution to the winning participant
   - Event emissions for round lifecycle (start, participation, completion)

2. **Caller Bot (`scripts/ts/src/caller-bot.ts`)**
   - Implements simple random timing strategy
   - Uses configurable gas prices within a predefined range
   - Monitors the contract state to detect active rounds
   - Each bot instance represents a single participant with its own wallet

3. **Game Manager (`scripts/ts/src/game-manager.ts`)**
   - Starts new rounds with random target positions (N)
   - Provides rewards (1 ETH) for each round
   - Monitors active rounds and ends them if they run too long
   - Keeps track of statistics (total rounds, user wins, win rate)
   - Handles event processing for round completion and winner selection

4. **Your MEV Bot (`index.ts`)**
   - The file you'll implement containing advanced MEV strategies
   - Connects to Ethereum node via WebSocket and HTTP
   - Monitors mempool and optimizes transaction submission

### 4.3 Key Methods to Implement

Your main task is to implement the `index.ts` bot to maximize your chances of winning. This involves:

1. **Pending Transaction Monitoring**
   ```typescript
   private async subscribePendingTransactions(wsProvider): Promise<boolean> {
     // Monitor the mempool for participate() calls
     // Track gas prices and positions
     // Update strategy based on mempool data
   }
   ```

2. **Block Monitoring**
   ```typescript
   private async subscribeNewBlocks(): Promise<boolean> {
     // Process new blocks to update round state
     // Check for transaction confirmations
     // Reset mempool data after each block
   }
   ```

3. **Strategic Participation**
   ```typescript
   private async findOptimalPositionAndSendTransaction(): Promise<void> {
     // Calculate optimal timing based on current state
     // Determine appropriate gas price
     // Submit transaction if conditions are favorable
   }
   ```

### 4.4 Setup Script (setup.sh)

The `setup.sh` script automates the setup and execution of the MEV challenge environment:

1. **Initial Setup**: Creates necessary directories and checks if Docker is running
2. **Cleanup**: Removes any existing containers and images from previous runs
3. **Anvil Node**: Starts an Ethereum Anvil node for local development
4. **Contract Deployment**: Deploys the Caller contract to the local node
5. **Bot Startup**: Launches the participant bots to compete in the challenge
6. **Game Manager**: Starts the game manager to control the competition flow
7. **Monitoring**: Provides real-time logs of the running containers

## 5. Running Tests

### 5.1 Requirements

To run the MEV challenge, you need the following software installed on your system:

- **Node.js** v20.x or later
- **Docker** v28.x or later
- **Docker Compose** v2.x or later

You can check your installed versions with the following commands:

```bash
node --version
docker --version
docker compose version
```

Make sure Docker daemon is running before executing the setup script.

### 5.2 Getting Started

To start the MEV challenge:

```bash
# Install dependencies
npm i

# Make the setup script executable
chmod +x ./setup.sh

# Run the setup script
./setup.sh
```

**Important Notes:**
- Rename `.env.example` to `.env` before running the setup. The private keys in `.env.example` are test keys from the Anvil node. Never use these on the actual mainnet.
- The `./shared` folder and `./shared/addresses.json` file will be automatically created when you run the setup script.

The script will set up the environment, deploy the contracts, and start the bots and game manager. You can then observe the competition in real-time through the logs.

To stop the challenge:
- On Mac: Press `Command + C`
- On Windows: Press `Ctrl + C`

### 5.3 Stopping the Challenge

To stop the running containers:

```bash
docker compose down
```

This will stop all running containers and free up resources.

### 5.4 Implementation Goals

- The game manager tracks your MEV bot's success rate. Your goal is to maximize this success rate - there is no fixed target percentage.
- Do NOT use a DDOS approach with random transaction spamming. While this could be an effective strategy in certain situations, we recommend exploring other approaches in this learning module.
- Focus on implementing intelligent strategies that analyze mempool data and make strategic decisions about when to participate.
- Your solution should demonstrate an understanding of gas price optimization and transaction timing.

---

Happy MEV hunting! 🚀
