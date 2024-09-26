import { ethers } from "ethers";
import dotenv from "dotenv";
import { expect } from "chai";

dotenv.config();

describe("#Account Hands-on Session", () => {
  it("Create a new EOA (PrivateKey, PublicKey (Compressed), Address) using ethers.js", async () => {
    // Set below
    let privateKey = "";
    let publicKey = "";
    let address = "";

    //
    // Implement Here
    //

    expect(privateKey).to.be.a("string");
    expect(privateKey.startsWith("0x")).to.be.true;
    expect(privateKey.length).to.equal(66);

    expect(publicKey).to.be.a("string");
    expect(publicKey.startsWith("0x")).to.be.true;
    expect(publicKey.length).to.equal(68);

    expect(address).to.be.a("string");
    expect(address.startsWith("0x")).to.be.true;
    expect(address.length).to.equal(42);

    expect(ethers.utils.isAddress(address)).to.be.true;

    const computedAddress = ethers.utils.computeAddress(publicKey);
    expect(computedAddress.toLowerCase()).to.equal(address.toLowerCase());
  });

  it("Generate a fixed EOA, receive faucet Ether, and verify non-zero balance", async () => {
    // Set process.env.PRIVATE_KEY in .env file
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey.length === 0) {
      throw new Error("PRIVATE_KEY is not defined in environment variables.");
    }
    const wallet = new ethers.Wallet(privateKey);

    // Set up provider using Infura(https://app.infura.io/) for the Ethereum Sepolia test network
    // Replace <API Key> with your Infura project key
    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/<API Key>"
    );

    // Get Ether from Sepolia faucet for the wallet address (https://faucets.chain.link/sepolia)
    const balance = await provider.getBalance(wallet.address);

    // Verify that the balance is not 0 (i.e., Ether was successfully received from the faucet)
    expect(balance.toString()).to.not.equal("0");
  });
});
