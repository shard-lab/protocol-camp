import dotenv from "dotenv";
import { expect } from "chai";
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
} from "@aptos-labs/ts-sdk";

dotenv.config();

describe("#Aptos Account Hands-on Session", () => {
  it("Create a new Aptos account (PrivateKey, PublicKey, Address)", async () => {
    // Set below using Account from "@aptos-labs/ts-sdk";
    let privateKey = "";
    let publicKey = "";
    let address = "";

    //
    // Implement Here
    //

    // Assertions
    expect(privateKey).to.be.a("string");
    expect(privateKey.startsWith("0x")).to.be.true;
    expect(privateKey.length).to.be.greaterThan(10);

    expect(publicKey).to.be.a("string");
    expect(publicKey.startsWith("0x")).to.be.true;
    expect(publicKey.length).to.be.greaterThan(10);

    expect(address).to.be.a("string");
    expect(address.startsWith("0x")).to.be.true;
    expect(address.length).to.equal(66);

    console.log("Generated Account:", { privateKey, publicKey, address });
  });

  it("Generate a fixed account, receive faucet coins, and verify non-zero balance", async () => {
    const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

    // Set process.env.PRIVATE_KEY_HEX in .env file
    const privateKeyHex = process.env.PRIVATE_KEY_HEX;
    if (!privateKeyHex || privateKeyHex.length === 0) {
      throw new Error(
        "PRIVATE_KEY_HEX is not defined in environment variables."
      );
    }

    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex),
    });

    //
    // Implement Here
    //

    const balance = await aptos.getAccountAPTAmount({
      accountAddress: account.accountAddress,
    });

    // // Verify that the balance is not 0
    expect(balance).to.be.greaterThan(0);
  });
});
