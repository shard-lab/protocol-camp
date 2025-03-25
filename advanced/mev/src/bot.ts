import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { sleep } from "./utils";
import { loadConfig } from "./config";
dotenv.config();

/**
 * Bot class represents a participant in the MEV competition.
 * 
 * Each bot instance is responsible for:
 * 1. Maintaining its own wallet and connection to the contract
 * 2. Monitoring the current round state
 * 3. Submitting participation transactions with randomized gas prices
 * 4. Implementing a simple strategy with randomized timing
 */
class Bot {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly contract: ethers.Contract;
  private readonly name: string;
  private readonly minGasPrice: bigint;
  private readonly maxGasPrice: bigint;
  private readonly participateInterval: number;
  
  /**
   * Create a new bot instance
   * 
   * @param anvilUrl - URL of the Ethereum node (Anvil - foundry node)
   * @param mevAddress - Address of the MEV contract
   * @param mevAbi - ABI of the MEV contract
   * @param config - Bot configuration including name, privateKey, gas prices, and interval
   */
  constructor(
    anvilUrl: string,
    mevAddress: string,
    mevAbi: string[],
    config: {
      name: string;
      privateKey: string;
      minGasPrice: bigint;
      maxGasPrice: bigint;
      participateInterval: number;
    }
  ) {
    this.name = config.name;
    this.minGasPrice = config.minGasPrice;
    this.maxGasPrice = config.maxGasPrice;
    this.participateInterval = config.participateInterval;
    this.provider = new ethers.JsonRpcProvider(anvilUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(mevAddress, mevAbi, this.wallet);
    console.log(`Bot ${this.name}: addr=${this.wallet.address.substring(0, 10)}..., gas=${this.minGasPrice}-${this.maxGasPrice}`);
  }
  
  /**
   * Start the participation loop for this bot
   * This method initiates the main bot logic and keeps it running
   */
  public async start(): Promise<void> {
    try {
      await this.participateLoop();
    } catch (error) {
      console.error(`${this.name} critical error:`, error);
    }
  }
  
  /**
   * Generate random gas price between min and max range
   * This randomization creates variability in transaction priority
   * 
   * @returns A random gas price within the configured range
   */
  private getRandomGasPrice(): bigint {
    return this.minGasPrice + BigInt(Math.floor(Math.random() * Number(this.maxGasPrice - this.minGasPrice)));
  }
  
  /**
   * Generate random interval for timing between participation attempts
   * This randomization prevents bots from having predictable patterns
   * 
   * @returns A random time interval in milliseconds
   */
  private getRandomInterval(): number {
    return Math.floor(this.participateInterval + Math.random() * (this.participateInterval * 0.5));
  }
  
  /**
   * Main participation loop that continually checks round state and attempts to participate
   * This is the core bot logic that runs indefinitely
   */
  private async participateLoop(): Promise<void> {
    while (true) {
      try {
        // Check if round is active
        const [currentRound, targetN, currentCount, roundActive, currentReward] = await this.contract.getRoundInfo();
        
        if (roundActive) {
          // Generate random gas price
          const gasPrice = this.getRandomGasPrice();
          
          // Send participation transaction
          try {
            await this.contract.participate({
              gasPrice: gasPrice,
              gasLimit: 1000000
            });
          } catch (txError: any) {
            if (!txError.message.includes("already participated")) {
              console.error(`${this.name} tx failed: ${txError.message}`);
            }
          }
        }
      } catch (error: any) {
        if (!error.message.includes("already participated")) {
          console.error(`${this.name} error: ${error.message}`);
        }
      }
      
      // Wait until next participation attempt (random interval)
      const interval = this.getRandomInterval();
      await sleep(interval);
    }
  }
}

async function main() {
  const MIN_GAS_PRICE = ethers.parseUnits("1", "gwei");
  const MIN_PARTICIPATE_INTERVAL = 3000; // 3 seconds
  const config = loadConfig();
  const bots: Bot[] = [];
  for (const botConfig of config.bots) {
    const bot = new Bot(config.anvilUrl, config.mevAddress, config.mevAbi, {
      name: botConfig.name,
      privateKey: botConfig.pk,
      minGasPrice: MIN_GAS_PRICE,
      maxGasPrice: MIN_GAS_PRICE + 20n,
      participateInterval: MIN_PARTICIPATE_INTERVAL
    });
    bots.push(bot);
  }
  
  // Start all bots
  for (const bot of bots) {
    bot.start().catch(error => {
      console.error(`Bot startup error:`, error);
    });
  }
  
  // Keep process running
  process.stdin.resume();
}

main().catch(error => {
  console.error("Main error:", error);
  process.exit(1);
});