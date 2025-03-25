import { ethers } from "ethers";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

export interface Participant {
  name: string;
  pk: string;
  address: string;
}

export interface Config {
  anvilUrl: string;
  mevContractOwnerPk: string;
  user: Participant;
  bots: Participant[];
  participants: Participant[];
  mevAddress: string;
  mevAbi: string[];
}

export const loadConfig = (): Config => {
    const mevABI = [
        "function owner() view returns (address)",
        "function currentRound() view returns (uint256)",
        "function targetN() view returns (uint256)",
        "function currentCount() view returns (uint256)",
        "function roundActive() view returns (bool)",
        "function reward() view returns (uint256)",
        "function startNewRound(uint256 _targetN) external payable",
        "function participate() external",
        "function forceEndRound() external",
        "function getRoundInfo() view returns (uint256 _currentRound, uint256 _targetN, uint256 _currentCount, bool _roundActive, uint256 _reward)",
        "function getRoundWinner(uint256 _round) view returns (address)",
        "function getRoundReward(uint256 _round) view returns (uint256)",
        "function getLastPosition(uint256 _round, address _participant) view returns (uint256)",
        "function getAllPositions(uint256 _round, address _participant) view returns (uint256[])",
        "function getParticipationCount(uint256 _round, address _participant) view returns (uint256)",
        "event RoundStarted(uint256 indexed round, uint256 targetN, uint256 reward)",
        "event Participated(uint256 indexed round, address indexed participant, uint256 position)",
        "event WinnerSelected(uint256 indexed round, address indexed winner, uint256 reward)",
        "event RoundEnded(uint256 indexed round)"
    ];
    
    const bots: Participant[] = [{
        name: "Bot1",
        pk: getRequiredEnv("BOT1_PK", "Bot1 private key is required for simulating competition"),
        address: new ethers.Wallet(getRequiredEnv("BOT1_PK", "Bot1 private key is required for simulating competition")).address,
    }, {
        name: "Bot2",
        pk: getRequiredEnv("BOT2_PK", "Bot2 private key is required for simulating competition"),
        address: new ethers.Wallet(getRequiredEnv("BOT2_PK", "Bot2 private key is required for simulating competition")).address,
    }, {
        name: "Bot3",
        pk: getRequiredEnv("BOT3_PK", "Bot3 private key is required for simulating competition"),
        address: new ethers.Wallet(getRequiredEnv("BOT3_PK", "Bot3 private key is required for simulating competition")).address,
    }, {
        name: "Bot4",
        pk: getRequiredEnv("BOT4_PK", "Bot4 private key is required for simulating competition"),
        address: new ethers.Wallet(getRequiredEnv("BOT4_PK", "Bot4 private key is required for simulating competition")).address,
    }, {
        name: "Bot5",
        pk: getRequiredEnv("BOT5_PK", "Bot5 private key is required for simulating competition"),
        address: new ethers.Wallet(getRequiredEnv("BOT5_PK", "Bot5 private key is required for simulating competition")).address,
    }];
    const user: Participant = {
        name: "User",
        pk: getRequiredEnv("USER_PK", "User private key is required for the main MEV bot"),
        address: new ethers.Wallet(getRequiredEnv("USER_PK", "User private key is required for the main MEV bot")).address,
    };
    const participants: Participant[] = [...bots, user];
    const config: Config = {
        anvilUrl: getRequiredEnv("ANVIL_URL", "Anvil URL is required for connecting to the blockchain"),
        mevContractOwnerPk: getRequiredEnv("MEV_CONTRACT_OWNER_PK", "Contract owner private key is required for deploying and managing rounds"),
            user: user,
        bots: bots,
        participants: participants,
        mevAddress: "",
        mevAbi: mevABI,
    };

    const addressesPath = path.resolve(__dirname, "../shared/addresses.json");
    if (fs.existsSync(addressesPath)) {
        const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
        config.mevAddress = addresses.mev;
    }
    if (!config.mevAddress) {
        console.warn("Warning: mev address not found in addresses.json, using fallback address");
        config.mevAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    }



    return config;
};

function getRequiredEnv(name: string, errorMessage?: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(errorMessage || `Required environment variable ${name} is not defined`);
    process.exit(1);
  }
  return value;
}
