import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { loadConfig } from "./config";
dotenv.config();

/**
 * RoundStats interface tracks the statistics of the competition
 */
interface RoundStats {
  totalRounds: number;  // Total number of rounds played
  userWins: number;     // Number of rounds won by the user
  getWinRate(): number; // Calculate the win rate as a percentage
}

/**
 * Participant interface defines a participant in the competition
 */
interface Participant {
  name: string;    // Display name of the participant
  address: string; // Ethereum address of the participant
}

/**
 * GameManager class is responsible for orchestrating the MEV competition
 * 
 * This class handles:
 * 1. Starting new rounds with random target positions
 * 2. Monitoring active rounds and enforcing timeouts
 * 3. Managing rewards for winners
 * 4. Tracking competition statistics
 * 5. Processing contract events related to rounds
 */
class GameManager {
  private monitorTimer: NodeJS.Timeout | null = null;
  private readonly provider: ethers.JsonRpcProvider;
  private readonly owner: ethers.Wallet;
  private readonly mevContract: ethers.Contract;
  private readonly stats: RoundStats;
  private readonly checkInterval: number;
  private readonly minN: number;
  private readonly maxN: number;
  private readonly participants: Participant[];
  private readonly userAddress: string;
  
  /**
   * Create a new GameManager instance
   * 
   * @param anvilUrl - URL of the Ethereum node
   * @param mevAddress - Address of the MEV contract
   * @param ownerPrivateKey - Private key of the contract owner
   * @param userAddress - Address of the user to track for statistics
   * @param participants - List of all participants for name resolution
   * @param mevAbi - ABI of the MEV contract
   * @param options - Configuration options including intervals and target ranges
   */
  constructor(
    anvilUrl: string,
    mevAddress: string,
    ownerPrivateKey: string,
    userAddress: string,
    participants: Participant[] = [],
    mevAbi: string[],
    options = {
      checkInterval: 5000, // 5 seconds
      minN: 3,
      maxN: 10
    }
  ) {
    this.provider = new ethers.JsonRpcProvider(anvilUrl);
    this.owner = new ethers.Wallet(ownerPrivateKey, this.provider);
    this.mevContract = new ethers.Contract(mevAddress, mevAbi, this.owner);
    this.stats = {
      totalRounds: 0,
      userWins: 0,
      getWinRate(): number {
        return this.totalRounds > 0 ? (this.userWins / this.totalRounds) * 100 : 0;
      }
    }
    this.checkInterval = options.checkInterval;
    this.minN = options.minN;
    this.maxN = options.maxN;
    this.participants = participants;
    this.userAddress = userAddress;
  }
  
  /**
   * Start the game manager and initialize the first round
   * This is the main entry point for the game manager's operation
   */
  public async start(): Promise<void> {
    console.log("Starting Game Manager...");
    
    // Check deployer balance
    const ownerBalance = await this.provider.getBalance(this.owner.address);
    console.log(`Owner balance: ${ethers.formatEther(ownerBalance)} ETH`);
    
    // Verify contract owner
    const owner = await this.mevContract.owner();
    if (owner.toLowerCase() !== this.owner.address.toLowerCase()) {
      console.error("Owner is not the contract owner");
      process.exit(1);
    }
    
    // Load stats from previous rounds
    await this.loadStats();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check current round info
    const [currentRound, targetN, currentCount, roundActive, currentReward] = await this.mevContract.getRoundInfo();
    console.log(`Round #${currentRound} | Target: ${targetN} | Count: ${currentCount} | Active: ${roundActive} | Reward: ${ethers.formatEther(currentReward)} ETH`);
    
    // Start new round if not active
    if (!roundActive) {
      await this.startNewRound();
    } else {
      // Start round monitoring
      this.startRoundMonitoring();
    }
    
    // Keep process running
    process.stdin.resume();
  }
  
  /**
   * Set up event listeners for contract events
   * 
   * This function configures listeners for:
   * 1. WinnerSelected - When a round is completed with a winner
   * 2. RoundEnded - When a round is forcibly ended
   */
  private setupEventListeners(): void {
    // Round winner selected event
    this.mevContract.on("WinnerSelected", async (round, winner, reward) => {
      const winnerAddress = winner.toLowerCase();
      const winnerName = this.getParticipantName(winnerAddress);
      
      console.log(`\n🏆 ROUND #${round} ENDED | Winner: ${winnerName} | Reward: ${ethers.formatEther(reward)} ETH`);
      
      // Update statistics
      this.stats.totalRounds++;
      if (winnerAddress === this.userAddress.toLowerCase()) {
        this.stats.userWins++;
      }
      
      // Print statistics
      console.log(`📊 STATS: USER won ${this.stats.userWins}/${this.stats.totalRounds} rounds (${this.stats.getWinRate().toFixed(2)}%)\n`);
      
      // Start new round
      await this.startNewRound();
    });
    
    // Round ended event listener
    this.mevContract.on("RoundEnded", async (round) => {
      console.log(`\n🛑 ROUND #${round} FORCE ENDED`);
      
      // Update statistics for forced end rounds
      this.stats.totalRounds++;
      
      // Print statistics
      console.log(`📊 STATS: USER won ${this.stats.userWins}/${this.stats.totalRounds} rounds (${this.stats.getWinRate().toFixed(2)}%)`);
      
      await this.startNewRound();
    });
  }
  
  /**
   * Get participant name from address
   * 
   * @param address - Ethereum address of the participant
   * @returns The name of the participant or a shortened address if not found
   */
  private getParticipantName(address: string): string {
    const participant = this.participants.find(p => p.address.toLowerCase() === address);
    return participant?.name || address.substring(0, 10) + "...";
  }
  
  /**
   * Load statistics from previous rounds
   * 
   * This function queries the blockchain for historical data to:
   * 1. Count total completed rounds
   * 2. Identify rounds won by the user
   * 3. Calculate win statistics
   */
  private async loadStats(): Promise<void> {
    try {
      console.log("Loading historical stats...");
      
      // Get the current round number
      const [currentRound] = await this.mevContract.getRoundInfo();
      
      // If it's the first round, no need to load statistics
      if (currentRound <= 1) return;
      
      // Iterate through previous rounds to count wins
      for (let i = 1; i < currentRound; i++) {
        const winner = await this.mevContract.getRoundWinner(i);
        if (winner && winner !== ethers.ZeroAddress) {
          this.stats.totalRounds++;
          if (winner.toLowerCase() === this.userAddress.toLowerCase()) {
            this.stats.userWins++;
          }
        }
      }
      
      console.log(`📊 Loaded historical stats: USER won ${this.stats.userWins}/${this.stats.totalRounds} rounds (${this.stats.getWinRate().toFixed(2)}%)`);
    } catch (error) {
      console.error("Error loading historical stats:", error);
    }
  }
  
  /**
   * Monitor round state and force end if necessary
   * 
   * This function periodically checks the current round and:
   * 1. Detects stalled rounds that have been active too long
   * 2. Forces rounds to end if they've reached a significant portion of the target
   * 3. Stops monitoring when rounds complete naturally
   */
  private startRoundMonitoring(): void {
    // Clear previous timer
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    
    // Start round monitoring
    this.monitorTimer = setInterval(async () => {
      try {
        // Check current round info
        const [currentRound, targetN, currentCount, roundActive] = await this.mevContract.getRoundInfo();
        
        // Check if round is active but running for too long
        if (roundActive && currentCount > 0) {
          const lastBlockTimestamp = (await this.provider.getBlock("latest"))!.timestamp;
          const roundStartedEvent = await this.mevContract.queryFilter(
            this.mevContract.filters.RoundStarted(currentRound, null, null)
          );
          
          if (roundStartedEvent.length > 0) {
            const roundStartTime = (await roundStartedEvent[0].getBlock()).timestamp;
            const elapsedTime = lastBlockTimestamp - roundStartTime;
            
            // Force end if 10+ minutes elapsed and 80%+ progress
            if (elapsedTime > 600 && currentCount >= targetN * 0.8) {
              console.log(`🔄 Force ending round #${currentRound} after ${Math.floor(elapsedTime / 60)}m...`);
              await this.mevContract.forceEndRound();
            }
          }
        }
        
        // Stop monitoring if round is inactive
        if (!roundActive) {
          if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
          }
        }
      } catch (error) {
        console.error("Monitoring error:", error);
      }
    }, this.checkInterval);
  }
  
  /**
   * Generate random N value within configured range
   * 
   * @returns A random integer between minN and maxN (inclusive)
   */
  private getRandomN(): number {
    return Math.floor(this.minN + Math.random() * (this.maxN - this.minN + 1));
  }
  
  /**
   * Start a new round with a random target N
   * 
   * This function:
   * 1. Creates a new round with a random target position
   * 2. Funds the round with 1 ETH as reward
   * 3. Starts monitoring the new round
   */
  private async startNewRound(): Promise<void> {
    try {
      const tx = await this.mevContract.startNewRound(this.getRandomN(), {
        value: ethers.parseEther("1")
      });
      await tx.wait();
      
      const [newRound, newTargetN, , , newReward] = await this.mevContract.getRoundInfo();
      console.log(`🔄 NEW ROUND #${newRound} | Target: ${newTargetN} | Reward: ${ethers.formatEther(newReward)} ETH`);
      
      // Start round monitoring
      this.startRoundMonitoring();
    } catch (error) {
      console.error("Error starting new round:", error);
    }
  }
}

async function main() {
  const config = loadConfig();
  const gameManager = new GameManager(
    config.anvilUrl,
    config.nthCallerGameAddress,
    config.nthCallerGameOwnerPk,
    config.user.address,
    config.participants.map(p => ({ name: p.name, address: p.address })),
    config.nthCallerGameAbi,
    {
      checkInterval: 5000,
      minN: 3,
      maxN: 10
    }
  );
  
  // Start round manager
  await gameManager.start();
}

main().catch(error => {
  console.error("Game Manager error:", error);
  process.exit(1);
});