import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { ANVIL_URL, MevABI, mevAddress, USER } from "./config";
import {
  createWebSocketManager,
  DEFAULT_MAX_RECONNECT_ATTEMPTS,
  DEFAULT_RECONNECT_DELAY,
  WebSocketManager
} from "./utils";

dotenv.config();

interface RoundInfo {
  round: number;
  targetN: number;
  currentCount: number;
  active: boolean;
  reward: bigint;
  lastUpdated: number;
}

let provider: ethers.JsonRpcProvider;
let userWallet: ethers.Wallet;
let mevContract: ethers.Contract;
let wsManager: WebSocketManager;

/**
 * Initialize providers and contracts
 */
function initializeProviders() {
  try {
    // Initialize HTTP provider and wallet
    provider = new ethers.JsonRpcProvider(ANVIL_URL);
    userWallet = new ethers.Wallet(USER.pk, provider);
    
    // Initialize contract
    mevContract = new ethers.Contract(mevAddress, MevABI, provider);
    mevContract = mevContract.connect(userWallet) as ethers.Contract;
    
    // Initialize WebSocket manager with reconnection capabilities
    wsManager = createWebSocketManager(
      "ws://localhost:8545",
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
          const pendingSuccess = await subscribePendingTransactions(wsProvider);
          return pendingSuccess;
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error("Error initializing providers:", error);
    return false;
  }
}

/**
 * Main function to start the MEV bot
 */
async function main() {
  console.log(`Starting MEV bot for contract: ${mevAddress}`);
  
  // Initialize providers and contracts
  if (!initializeProviders()) {
    console.error("Failed to initialize providers. Exiting...");
    process.exit(1);
  }
  console.log(`User: ${USER.address}`);
  console.log(`Balance: ${ethers.formatEther(await provider.getBalance(USER.address))} ETH`);
  
  // Set up event listeners
  setupEventListeners();
  
  // Start monitoring pending transactions and new blocks
  const wsProvider = wsManager.initialize();
  await subscribePendingTransactions(wsProvider);
  await subscribeNewBlocks();
  
  console.log("\n==================================================");
  console.log("🤖 MEV bot ready");
  console.log("🔄 Waiting for rounds...");
  console.log("==================================================\n");
  process.stdin.resume();
}

/**
 * Subscribe to pending transactions in the mempool
 * This function monitors the mempool for new participation transactions
 */
async function subscribePendingTransactions(wsProvider = wsManager.getProvider()) {
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
 * This function reacts to each new block, updating round info and checking transactions
 */
async function subscribeNewBlocks() {
  console.log("Subscribing to new blocks...");
  
  try {
    provider.removeAllListeners("block");
    
    provider.on("block", async (blockNumber) => {
      console.log(`Block #${blockNumber}`);
      
    });
    
    console.log("Successfully subscribed to new blocks");
  } catch (error) {
    console.error("Failed to subscribe to new blocks:", error);
    setTimeout(() => {
      console.log("Attempting to resubscribe to blocks...");
      subscribeNewBlocks();
    }, DEFAULT_RECONNECT_DELAY);
  }
}

/**
 * Send a participation transaction with the given gas price
 */
async function sendParticipationTransaction(gasPrice: bigint) {
  try {
    const tx = await mevContract.participate({
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
 */
function setupEventListeners() {
  // Remove existing listeners first to prevent duplicates
  mevContract.removeAllListeners();
  
  // Round started event
  mevContract.on("RoundStarted", async (round, targetN, reward) => {

  });
  
  // Participation event
  mevContract.on("Participated", async (round, participant, position) => {

  });
  
  // Winner selected event
  mevContract.on("WinnerSelected", async (round, winner, reward) => {

  });
}

// Start the bot
main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
}); 