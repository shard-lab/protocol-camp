import baseConfig from "../../hardhat.config";
import { HardhatUserConfig } from "hardhat/config";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  ...baseConfig,
  solidity: "0.8.20",
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
