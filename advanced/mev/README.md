# MEV Challenge Project

The MEV (Maximal Extractable Value) challenge is a hands-on project to understand MEV concepts by implementing a bot that competes to be the N-th caller of a smart contract function.

## Requirements

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

## Package Structure

```
.
├── docker/            # Docker configuration for running the project
├── logs/              # Log outputs from the bots and round manager
├── scripts/ts/src/    # TypeScript source code
│   ├── config.ts      # Configuration values and settings
│   ├── mev.ts         # Main MEV bot logic implementation
│   ├── round-manager.ts # Manages the rounds of the competition
│   └── utils.ts       # Utility functions and helpers
├── shared/            # Shared data between containers
├── foundry/           # Solidity smart contracts and Foundry project
│   └── Mev.sol        # The smart contract for the MEV competition
│   └── Deploy.s.sol   # Script to deploy the Mev contract
│   └── foundry.toml   # Foundry configuration file
├── docker-compose.yml # Docker compose configuration
├── setup.sh           # Setup script to prepare and run the project
└── README.md          # Project documentation
```

## Setup Script (setup.sh)

The `setup.sh` script automates the setup and execution of the MEV challenge environment:

1. **Initial Setup**: Creates necessary directories and checks if Docker is running
2. **Cleanup**: Removes any existing containers and images from previous runs
3. **Anvil Node**: Starts an Ethereum Anvil node for local development
4. **Contract Deployment**: Deploys the MEV contract to the local node
5. **Bot Startup**: Launches the participant bots to compete in the challenge
6. **Round Manager**: Starts the round manager to control the competition flow
7. **Monitoring**: Provides real-time logs of the running containers

## Bot and Round Manager

### Bot (`mev.ts`)

The bot is the central component of the MEV challenge. Students are expected to implement key methods to create an effective MEV bot:

- **Pending Transaction Monitoring**: Subscribes to mempool transactions to detect other participants
- **Block Monitoring**: Processes new blocks to update round state
- **Strategic Participation**: Calculates the optimal time and gas price to submit transactions to hit the target position

The bot uses WebSocket connections to monitor the blockchain in real-time and implements reconnection logic for resilience.

### Round Manager (`round-manager.ts`)

The round manager orchestrates the MEV competition:

- Starts new rounds with random target positions (N)
- Provides rewards (1 ETH) for each round
- Monitors active rounds and ends them if they run too long
- Keeps track of statistics (total rounds, user wins, win rate)
- Handles event processing for round completion and winner selection

## Smart Contract

### Mev.sol

The `Mev.sol` contract implements the core competition logic:

- `participate()`: Function that participants call to compete
- Round state management (tracking the current count of participants)
- Target position (N) that participants try to hit
- Winner selection logic when the N-th position is reached
- Reward distribution to the winning participant
- Event emissions for round lifecycle (start, participation, completion)

The contract maintains a sequential counter and the participant who hits the exact target position (N) wins the round's reward.

## Implementation Challenge

Your main task is to implement the `mev.ts` bot to maximize your chances of winning. This involves:

1. Implementing efficient mempool monitoring
2. Calculating the optimal time to submit your transaction
3. Setting appropriate gas prices to outbid competitors
4. Building reconnection logic for reliable WebSocket connections
5. Applying strategic decision-making based on current round state

The challenge simulates real MEV competition scenarios where bots compete for profitable positions in the blockchain's execution order.

## Getting Started

To start the MEV challenge:

```bash
# Navigate to the mev directory
cd basics/ethereum/mev

# Run the setup script
./setup.sh
```

The script will set up the environment, deploy the contracts, and start the bots and round manager. You can then observe the competition in real-time through the logs.

## Stopping the Challenge

To stop the running containers:

```bash
docker compose down
```

This will stop all running containers and free up resources.

---

Happy MEV hunting! 🚀
