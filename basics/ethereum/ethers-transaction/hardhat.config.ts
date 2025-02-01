import baseConfig from "../../../hardhat.config"; // 루트에서 기본 설정을 가져옴
import { HardhatUserConfig } from "hardhat/config";

// 기본 설정을 확장하여 서브패키지에 맞는 경로 지정
const config: HardhatUserConfig = {
  ...baseConfig, // 루트 설정 확장,
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
