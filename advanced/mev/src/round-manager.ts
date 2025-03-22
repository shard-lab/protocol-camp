import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { MevABI, PARTICIPANTS, mevAddress, USER, ANVIL_URL, ROUND_MANAGER_PK } from "./config";

dotenv.config();

const CHECK_INTERVAL = 5000 // 5 seconds
const MIN_N = 3
const MAX_N = 10

// Statistics tracking
interface RoundStats {
  totalRounds: number;
  userWins: number;
  getWinRate(): number;
}

const stats: RoundStats = {
  totalRounds: 0,
  userWins: 0,
  getWinRate(): number {
    return this.totalRounds > 0 ? (this.userWins / this.totalRounds) * 100 : 0;
  }
};

// Generate random N value (MIN_N ~ MAX_N)
function getRandomN(): number {
  return Math.floor(MIN_N + Math.random() * (MAX_N - MIN_N + 1));
}

const provider = new ethers.JsonRpcProvider(ANVIL_URL);
const deployer = new ethers.Wallet(ROUND_MANAGER_PK, provider);
const mev = new ethers.Contract(mevAddress, MevABI, deployer);

let monitorTimer: NodeJS.Timeout | null = null;

async function startRoundManager() {
  console.log("Starting Round Manager...");
  if (!mevAddress) {
    console.error("Contract address not found");
    process.exit(1);
  }
  
  // Check deployer balance
  const deployerBalance = await provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} ETH`);
  
  // Verify contract owner
  const owner = await mev.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("Deployer is not the contract owner");
    process.exit(1);
  }
  
  // Load stats from previous rounds
  await loadStats();
  
  // Set up event listeners
  mev.on("WinnerSelected", async (round, winner, reward) => {
    const winnerAddress = winner.toLowerCase();
    const winnerName = PARTICIPANTS.find(p => p.address.toLowerCase() === winnerAddress)?.name || winnerAddress.substring(0, 10) + "...";
    
    console.log(`\n🏆 ROUND #${round} ENDED | Winner: ${winnerName} | Reward: ${ethers.formatEther(reward)} ETH`);
    
    // Update statistics
    stats.totalRounds++;
    if (winnerAddress === USER.address.toLowerCase()) {
      stats.userWins++;
    }
    
    // Print statistics
    console.log(`📊 STATS: USER won ${stats.userWins}/${stats.totalRounds} rounds (${stats.getWinRate().toFixed(2)}%)\n`);
    
    // Start new round
    await startNewRound();
  });
  
  // Round ended event listener
  mev.on("RoundEnded", async (round) => {
    console.log(`\n🛑 ROUND #${round} FORCE ENDED`);
    
    // Update statistics for forced end rounds
    stats.totalRounds++;
    
    // Print statistics
    console.log(`📊 STATS: USER won ${stats.userWins}/${stats.totalRounds} rounds (${stats.getWinRate().toFixed(2)}%)`);
    
    await startNewRound();
  });
  
  // Check current round info
  const [currentRound, targetN, currentCount, roundActive, currentReward] = await mev.getRoundInfo();
  console.log(`Round #${currentRound} | Target: ${targetN} | Count: ${currentCount} | Active: ${roundActive} | Reward: ${ethers.formatEther(currentReward)} ETH`);
  
  // Start new round if not active
  if (!roundActive) {
    await startNewRound();
  } else {
    // Start round monitoring
    startRoundMonitoring();
  }
  
  process.stdin.resume();
}

// Load statistics from previous rounds
async function loadStats() {
  try {
    console.log("Loading historical stats...");
    
    // Get the current round number
    const [currentRound] = await mev.getRoundInfo();
    
    // If it's the first round, no need to load statistics
    if (currentRound <= 1) return;
    
    // Iterate through previous rounds to count wins
    for (let i = 1; i < currentRound; i++) {
      const winner = await mev.getRoundWinner(i);
      if (winner && winner !== ethers.ZeroAddress) {
        stats.totalRounds++;
        if (winner.toLowerCase() === USER.address.toLowerCase()) {
          stats.userWins++;
        }
      }
    }
    
    console.log(`📊 Loaded historical stats: USER won ${stats.userWins}/${stats.totalRounds} rounds (${stats.getWinRate().toFixed(2)}%)`);
  } catch (error) {
    console.error("Error loading historical stats:", error);
  }
}

// Monitor round state
async function startRoundMonitoring() {
  // Clear previous timer
  if (monitorTimer) {
    clearInterval(monitorTimer);
  }
  
  // Start round monitoring
  monitorTimer = setInterval(async () => {
    try {
      // Check current round info
      const [currentRound, targetN, currentCount, roundActive] = await mev.getRoundInfo();
      
      // Check if round is active but running for too long
      if (roundActive && currentCount > 0) {
        const lastBlockTimestamp = (await provider.getBlock("latest"))!.timestamp;
        const roundStartedEvent = await mev.queryFilter(
          mev.filters.RoundStarted(currentRound, null, null)
        );
        
        if (roundStartedEvent.length > 0) {
          const roundStartTime = (await roundStartedEvent[0].getBlock()).timestamp;
          const elapsedTime = lastBlockTimestamp - roundStartTime;
          
          // Force end if 10+ minutes elapsed and 80%+ progress
          if (elapsedTime > 600 && currentCount >= targetN * 0.8) {
            console.log(`🔄 Force ending round #${currentRound} after ${Math.floor(elapsedTime / 60)}m...`);
            await mev.forceEndRound();
          }
        }
      }
      
      // Stop monitoring if round is inactive
      if (!roundActive) {
        if (monitorTimer) {
          clearInterval(monitorTimer);
          monitorTimer = null;
        }
      }
    } catch (error) {
      console.error("Monitoring error:", error);
    }
  }, CHECK_INTERVAL);
}

async function startNewRound() {
  try {
    const tx = await mev.startNewRound(getRandomN(), {
      value: ethers.parseEther("1")
    });
    await tx.wait();
    const [newRound, newTargetN, , , newReward] = await mev.getRoundInfo();
    console.log(`🔄 NEW ROUND #${newRound} | Target: ${newTargetN} | Reward: ${ethers.formatEther(newReward)} ETH`);
    
    // Start round monitoring
    startRoundMonitoring();
  } catch (error) {
    console.error("Error starting new round:", error);
  }
}

// Run script
startRoundManager().catch(error => {
  console.error("Round Manager error:", error);
  process.exit(1);
}); 