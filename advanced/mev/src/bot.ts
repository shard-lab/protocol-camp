import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { mevAddress, MevABI, BOTS, ANVIL_URL } from "./config";
import { sleep } from "./utils";

dotenv.config();

const MIN_GAS_PRICE = ethers.parseUnits("1", "gwei");
const MIN_PARTICIPATE_INTERVAL = 3000; // 3 seconds
const provider = new ethers.JsonRpcProvider(ANVIL_URL);

interface Bot {
  name: string;
  wallet: ethers.Wallet;
  contract: ethers.Contract;
  minGasPrice: bigint;
  maxGasPrice: bigint;
  participateInterval: number;
}

// Generate random gas price (min ~ max)
function getRandomGasPrice(min: bigint, max: bigint): bigint {
  return min + BigInt(Math.floor(Math.random() * Number(max - min)));
}

// Generate random interval (min ~ max)
function getRandomInterval(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}

async function startMultipleParticipantBots() {
  console.log(`Starting ${BOTS.length} participant bots...`);
  if (!mevAddress) {
    console.error("Mev contract address not found");
    process.exit(1);
  }
  
  // Create bot instances
  const bots: Bot[] = [];
  
  for (let i = 0; i < BOTS.length; i++) {
    const privateKey = BOTS[i].pk;
    const wallet = new ethers.Wallet(privateKey, provider);
    const minGasPrice = MIN_GAS_PRICE + (BigInt(i) * 2n);
    const maxGasPrice = minGasPrice + 20n;
    
    const bot: Bot = {
      name: BOTS[i].name,
      wallet,
      contract: new ethers.Contract(mevAddress, MevABI, wallet),
      minGasPrice,
      maxGasPrice,
      participateInterval: MIN_PARTICIPATE_INTERVAL + (i * 500)
    };
    
    bots.push(bot);
    console.log(`${bot.name}: addr=${bot.wallet.address.substring(0, 10)}..., gas=${bot.minGasPrice}-${bot.maxGasPrice}Gwei`);
  }
  
  // Start all bots
  for (const bot of bots) {
    participateLoop(bot).catch(error => {
      console.error(`${bot.name} critical error:`, error);
    });
  }
  
  process.stdin.resume();
}

// Periodically attempt to participate
async function participateLoop(bot: Bot) {
  while (true) {
    try {
      // Check if round is active
      const [currentRound, targetN, currentCount, roundActive, currentReward] = await bot.contract.getRoundInfo();
      
      if (roundActive) {
        // Generate random gas price
        const gasPrice = getRandomGasPrice(bot.minGasPrice, bot.maxGasPrice);
        
        // Send participation transaction
        try {
          await bot.contract.participate({
            gasPrice: gasPrice,
            gasLimit: 1000000
          });
        } catch (txError: any) {
          if (!txError.message.includes("already participated")) {
            console.error(`${bot.name} tx failed: ${txError.message}`);
          }
        }
      }
    } catch (error: any) {
      if (!error.message.includes("already participated")) {
        console.error(`${bot.name} error: ${error.message}`);
      }
    }
    
    // Wait until next participation attempt (random interval)
    const interval = getRandomInterval(bot.participateInterval, bot.participateInterval * 1.5);
    await sleep(interval);
  }
}

// Run script
startMultipleParticipantBots().catch(error => {
  console.error("Bot startup error:", error);
  process.exit(1);
}); 