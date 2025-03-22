import { ethers } from "ethers";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

export const ANVIL_URL = process.env.ANVIL_URL!!;
export const ROUND_MANAGER_PK = process.env.ROUND_MANAGER_PK!!;
export const BOT1_PK = process.env.BOT1_PK!!;
export const BOT2_PK = process.env.BOT2_PK!!;
export const BOT3_PK = process.env.BOT3_PK!!;
export const BOT4_PK = process.env.BOT4_PK!!;
export const BOT5_PK = process.env.BOT5_PK!!;
export const FALLBACK_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let addresses: { mev: string } = { mev: FALLBACK_ADDRESS };
const addressesPath = path.resolve(__dirname, "../shared/addresses.json");
if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
} 

export const MevABI = [
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

export const BOTS = [
    {
        name: "Bot1",
        pk: process.env.BOT1_PK!!,
        address: new ethers.Wallet(process.env.BOT1_PK!!).address,
    },
    {
        name: "Bot2",
        pk: process.env.BOT2_PK!!,
        address: new ethers.Wallet(process.env.BOT2_PK!!).address,
    },
    {
        name: "Bot3",
        pk: process.env.BOT3_PK!!,
        address: new ethers.Wallet(process.env.BOT3_PK!!).address,
    },
    {
        name: "Bot4",
        pk: process.env.BOT4_PK!!,
        address: new ethers.Wallet(process.env.BOT4_PK!!).address,
    },
    {
        name: "Bot5",
        pk: process.env.BOT5_PK!!,
        address: new ethers.Wallet(process.env.BOT5_PK!!).address,
    },
];

export const USER = {
    name: "User",
    pk: process.env.USER_PK!!,
    address: new ethers.Wallet(process.env.USER_PK!!).address,
}

export const PARTICIPANTS = [...BOTS, USER];

// Use the mev address from addresses.json, or fallback if not available
export const mevAddress = addresses.mev;