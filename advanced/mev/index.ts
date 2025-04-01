import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { loadConfig } from "./src/config";
import {
  createWebSocketManager,
  DEFAULT_MAX_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_DELAY,
  WebSocketManager
} from "./src/utils";

dotenv.config();

/**
 * RoundInfo interface represents the state of a round in the MEV competition
 */
interface RoundInfo {
  round: number;         // Current round number
  targetN: number;       // Target position that wins the round
  currentCount: number;  // Current number of participants
  active: boolean;       // Whether the round is active
  reward: bigint;        // Amount of ETH as reward
  lastUpdated: number;   // Timestamp when this info was last updated
}

/**
 * Mev class implements a bot for the MEV competition
 * 
 * This class is responsible for:
 * 1. Monitoring the mempool for pending transactions
 * 2. Tracking blockchain state and round information
 * 3. Implementing strategies to win the MEV competition
 * 4. Maintaining reliable WebSocket connections with reconnection logic
 * 5. Sending optimally timed and priced transactions
 */
class Mev {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly userWallet: ethers.Wallet;
  private readonly mevContract: ethers.Contract;
  private readonly wsManager: WebSocketManager;
  
  /**
   * Create a new MEV bot instance
   * 
   * @param anvilUrl - URL of the Ethereum JSON-RPC provider
   * @param mevAddress - Address of the MEV contract
   * @param privateKey - Private key of the user wallet
   * @param mevAbi - ABI of the MEV contract
   * @param wsUrl - WebSocket URL for mempool monitoring
   */
  constructor(
    anvilUrl: string,
    mevAddress: string,
    privateKey: string,
    mevAbi: string[],
    wsUrl: string = "ws://localhost:8545"
  ) {
    // Initialize HTTP provider and wallet
    this.provider = new ethers.JsonRpcProvider(anvilUrl);
    this.userWallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract
    this.mevContract = new ethers.Contract(mevAddress, mevAbi, this.provider);
    this.mevContract = this.mevContract.connect(this.userWallet) as ethers.Contract;
    
    // Initialize WebSocket manager with reconnection capabilities
    this.wsManager = createWebSocketManager(
      wsUrl,
      {
        maxAttempts: DEFAULT_MAX_RECONNECT_ATTEMPTS,
        reconnectDelay: DEFAULT_RECONNECT_DELAY
      },
      {
        onReconnectAttempt: (attempt, maxAttempts) => {
          console.log(`Reconnection attempt ${attempt}/${maxAttempts}...`);
        },
        onReconnectSuccess: (wsProvider) => {
          console.log("WebSocket reconnected. Resubscribing to events...");
        },
        onReconnectFailure: (error) => {
          console.error(`Failed to reconnect: ${error.message}. Using HTTP provider only.`);
        },
        onSubscriptionSetup: async (wsProvider) => {
          // Resubscribe to events
          const pendingSuccess = await this.subscribePendingTransactions(wsProvider);
          return pendingSuccess;
        }
      }
    );
  }
  
  /**
   * Overall MEV Bot Operation
   * 
   * The MEV bot operates through the following key phases:
   * 
   * 1. Initialization: Set up HTTP/WebSocket connections and contract event listeners
   * 2. Monitoring: 
   *    - Mempool: Track pending transactions, analyze gas prices and participants
   *    - Blockchain: Update round info from new blocks, confirm transactions
   * 3. Decision: Calculate current round state, participant count, optimal gas price, 
   *    and winning probability
   * 4. Execution: Call participate() at optimal moments with gas price higher than competitors
   * 
   * Key to success: Timing and gas price optimization to claim the exact Nth position
   */
  public async start(): Promise<void> {
    console.log(`Starting MEV bot for contract: ${await this.mevContract.getAddress()}`);
    const userAddress = this.userWallet.address;
    
    console.log(`User: ${userAddress}`);
    console.log(`Balance: ${ethers.formatEther(await this.provider.getBalance(userAddress))} ETH`);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start monitoring pending transactions and new blocks
    const wsProvider = this.wsManager.initialize();
    await this.subscribePendingTransactions(wsProvider);
    await this.subscribeNewBlocks();
    
    console.log("\n==================================================");
    console.log("🤖 MEV bot ready");
    console.log("🔄 Waiting for rounds...");
    console.log("==================================================\n");
    
    // Keep the process running
    process.stdin.resume();
  }
  
  /**
   * Subscribe to pending transactions in the mempool
   * 
   * This function monitors the mempool for new participation transactions to:
   * 1. Track other participants' transactions
   * 2. Analyze gas prices and timing
   * 3. Make strategic decisions about when to participate
   * 
   * @param wsProvider - WebSocket provider to use for subscription
   * @returns True if subscription was successful, false otherwise
   */
  private async subscribePendingTransactions(wsProvider = this.wsManager.getProvider()): Promise<boolean> {
    if (!wsProvider) {
      console.error("WebSocket provider not initialized");
      return false;
    }
    
    console.log("Subscribing to pending transactions...");
    
    try {
      // Remove any existing listeners to prevent duplicates
      wsProvider.removeAllListeners("pending");
      
      // Subscribe to newPendingTransactions
      wsProvider.on("pending", async (txHash) => {
        // ============= IMPLEMENTATION REQUIRED =============
        // TODO: Implement mempool monitoring logic
        throw new Error("subscribePendingTransactions handler not implemented!");
        // ===================================================
      });
      
      console.log("Successfully subscribed to pending transactions");
      return true;
    } catch (error) {
      console.error("Failed to subscribe to pending transactions:", error);
      return false;
    }
  }
  
  /**
   * Subscribe to new blocks
   * 
   * This function monitors new blocks to:
   * 1. Update round information
   * 2. Check transaction confirmations
   * 3. Make decisions based on blockchain state
   * 
   * @returns True if subscription was successful, false otherwise
   */
  private async subscribeNewBlocks(): Promise<boolean> {
    console.log("Subscribing to new blocks...");
    
    try {
      this.provider.removeAllListeners("block");
      
      this.provider.on("block", async (blockNumber) => {
        console.log(`Block #${blockNumber}`);
        
        // ============= IMPLEMENTATION REQUIRED =============
        // TODO: Implement block monitoring logic
        throw new Error("subscribeNewBlocks handler not implemented!");
        // ===================================================
      });
      
      console.log("Successfully subscribed to new blocks");
      return true;
    } catch (error) {
      console.error("Failed to subscribe to new blocks:", error);
      
      setTimeout(() => {
        console.log("Attempting to resubscribe to blocks...");
        this.subscribeNewBlocks();
      }, DEFAULT_RECONNECT_DELAY);
      
      return false;
    }
  }
  
  /**
   * Send a participation transaction with the given gas price
   * 
   * This function handles the actual transaction submission with error handling
   * 
   * @param gasPrice - Gas price to use for the transaction in wei
   */
  private async sendParticipationTransaction(gasPrice: bigint): Promise<void> {
    // ============= IMPLEMENTATION REQUIRED =============
    // TODO: Implement transaction sending logic
    // Your implementation should replace the following code
    try {
      const tx = await this.mevContract.participate({
        gasPrice: gasPrice,
        gasLimit: "2000000"
      });
      
      console.log(`Tx sent: ${tx.hash}`);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  }
  
  /**
   * Set up event listeners for contract events
   * 
   * This function sets up listeners for important contract events to:
   * 1. Track round starts and completions
   * 2. Monitor other participants' activities
   * 3. React to changes in contract state
   */
  private setupEventListeners(): void {
    // Remove existing listeners first to prevent duplicates
    this.mevContract.removeAllListeners();
    
    // Round started event
    this.mevContract.on("RoundStarted", async (round, targetN, reward) => {
      // ============= IMPLEMENTATION REQUIRED =============
      // TODO: Implement round start event handler
      throw new Error("RoundStarted event handler not implemented!");
      // ===================================================
    });
    
    // Participation event
    this.mevContract.on("Participated", async (round, participant, position) => {
      // ============= IMPLEMENTATION REQUIRED =============
      // TODO: Implement participation event handler
      throw new Error("Participated event handler not implemented!");
      // ===================================================
    });
    
    // Winner selected event
    this.mevContract.on("WinnerSelected", async (round, winner, reward) => {
      // ============= IMPLEMENTATION REQUIRED =============
      // TODO: Implement winner event handler
      throw new Error("WinnerSelected event handler not implemented!");
      // ===================================================
    });
  }
  
  /**
   * Find optimal position and send a transaction
   * 
   * This function determines if and when to send a participation transaction
   * based on the current state of the round and mempool
   */
  private async findOptimalPositionAndSendTransaction(): Promise<void> {
    // ============= IMPLEMENTATION REQUIRED =============
    // TODO: Implement position finding and transaction sending logic
    throw new Error("findOptimalPositionAndSendTransaction not implemented!");
    // ===================================================
  }
}

// Start the mev bot
async function main() {
  const config = loadConfig();
  const mevBot = new Mev(config.anvilUrl, config.nthCallerGameAddress, config.user.pk, config.nthCallerGameAbi);
  await mevBot.start();
}

// Start the mev bot
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 