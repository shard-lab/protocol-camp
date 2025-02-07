import { ethers } from "hardhat";
import { expect } from "chai";
import { SimpleStorage } from "../typechain/SimpleStorage";
import { SimpleStorage__factory } from "../typechain";
import { BigNumber } from "ethers";

describe("#Ethereum Transaction Hands-on Session", function () {
  it("Handle unit conversions between wei, gwei, and ether", async () => {
    // wei: The smallest unit in Ethereum. 1 Ether = 10^18 Wei.
    // gwei: 1 Gwei equals 10^9 Wei (1 billion Wei).
    // ether: The base unit of Ethereum. 1 Ether = 10^18 Wei.
    // 10 ^ 18 wei = 10 ^ 9 gwei = 1 ether

    // 1 Ether is equal to 10^18 Wei
    expect(ethers.utils.parseEther("1")).to.deep.equal(BigNumber.from("1000000000000000000"));

    // 10^18 Wei is equal to 1 Ether
    expect(ethers.utils.formatUnits("1000000000000000000", "ether")).to.equal("1.0");

    // 1 Gwei is equal to 10^9 Wei (1,000,000,000 Wei)
    expect(ethers.utils.parseUnits("1", "gwei")).to.deep.equal(BigNumber.from("1000000000"));

    // Convert 10^9 Wei to Gwei (which is 1 Gwei)
    expect(ethers.utils.formatUnits("1000000000", "gwei")).to.equal("1.0");
  });

  it("Send ether using ethers.js from sender to receiver", async () => {
    const [sender, receiver] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("1"); // 1 Ether = 10 ^ 18

    const initialBalance = await receiver.getBalance();

    //
    // Implement Here
    //

    const finalBalance = await receiver.getBalance();
    expect(finalBalance.sub(initialBalance)).to.deep.equal(amount);
  });

  it("Deploy a SimpleStorage contract", async () => {
    // SimpleStorage.sol is located in contracts folder(05-transaction/contracts/SimpleStorage.sol)
    const simpleStorageFactory = (await ethers.getContractFactory(
      "SimpleStorage"
    )) as SimpleStorage__factory;

    //
    // Modify and Implement Here
    const simpleStorage = {} as SimpleStorage;
    //

    expect(simpleStorage.address).to.be.not.null;
    console.log("Address of SimpleStorage:", simpleStorage.address);
  });

  it("Deploy and call a contract function to set and get a value", async function () {
    const simpleStorageFactory = (await ethers.getContractFactory(
      "SimpleStorage"
    )) as SimpleStorage__factory;

    //
    //  Modify and Implement Here
    const simpleStorage = {} as SimpleStorage;
    //

    expect(await simpleStorage.get()).to.deep.equal(BigNumber.from(100));
  });
});
