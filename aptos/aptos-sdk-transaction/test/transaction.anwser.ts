import dotenv from "dotenv";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";

dotenv.config();

describe("#Aptos Transaction Hands-on Session", function () {
  this.timeout(10000);

  const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));
  let sender: Account;

  before(() => {
    const privateKeyHex = process.env.PRIVATE_KEY_HEX;
    if (!privateKeyHex) {
      throw new Error("PRIVATE_KEY_HEX is not defined in environment variables.");
    }

    sender = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex),
    });
  });

  it("Handle unit conversions for APT (10^8 Octas = 1 APT)", async () => {
    // In Aptos, 1 APT = 10^8 Octas (smallest unit).
    const aptAmount = 1; // 1 APT
    const octaAmount = 100_000_000; // 1 APT = 10^8 Octas

    // Convert APT to Octas
    const calculatedOctas = aptAmount * 10 ** 8;
    expect(calculatedOctas).to.equal(octaAmount);

    // Convert Octas to APT
    const calculatedAPT = octaAmount / 10 ** 8;
    expect(calculatedAPT).to.equal(aptAmount);
  });

  it("Send APT tokens from sender to receiver", async function () {
    const receiver = Account.generate();

    //
    const initialBalance = await aptos.getAccountAPTAmount({
      accountAddress: sender.accountAddress,
    });
    expect(
      await aptos.getAccountAPTAmount({
        accountAddress: receiver.accountAddress,
      })
    ).to.be.equal(0);

    const transferAmount = 1_000_000;

    const rawtransaction = await aptos.transferCoinTransaction({
      sender: sender.accountAddress,
      recipient: receiver.accountAddress,
      amount: transferAmount,
    });

    const transaction = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: rawtransaction,
    });

    await aptos.waitForTransaction({
      transactionHash: transaction.hash,
    });

    const currentBalance = await aptos.getAccountAPTAmount({
      accountAddress: sender.accountAddress,
    });

    const executedTransaction = (await aptos.getTransactionByHash({
      transactionHash: transaction.hash,
    })) as UserTransactionResponse;

    const gasCost =
      Number(executedTransaction.gas_used) * Number(executedTransaction.gas_unit_price);

    expect(initialBalance - currentBalance).to.be.equal(transferAmount + gasCost);
    expect(
      await aptos.getAccountAPTAmount({
        accountAddress: receiver.accountAddress,
      })
    ).to.be.equal(transferAmount);
  });

  it("Deploy a SimpleStorage Module", async () => {
    const modulePath = path.join(__dirname, "../build/my-dapp/bytecode_modules/");

    const moduleFiles = fs.readdirSync(modulePath).filter((f) => f.endsWith(".mv"));

    const moduleData = moduleFiles.map((file) => {
      const bytecode = fs.readFileSync(path.join(modulePath, file));
      return bytecode.toString("hex");
    });

    const packageMetadataPath = path.join(__dirname, "../build/my-dapp/package-metadata.bcs");

    const packageMetadata = fs.readFileSync(packageMetadataPath).toString("hex");

    const rawtransaction = await aptos.publishPackageTransaction({
      account: sender.accountAddress,
      metadataBytes: packageMetadata,
      moduleBytecode: moduleData,
    });

    const transaction = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: rawtransaction,
    });

    await aptos.waitForTransaction({
      transactionHash: transaction.hash,
    });

    const deployedModule = await aptos.getAccountModule({
      accountAddress: sender.accountAddress,
      moduleName: "SimpleStorage",
    });

    expect(deployedModule).to.be.exist;
    expect(deployedModule.abi?.address).to.be.equal(sender.accountAddress.toString());
  });

  it("Set and get a value in SimpleStorage", async () => {
    const argument = 20241111;

    const rawtransaction = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function:
          "e699e1882aaf75a5130f5aa6af68446aa3819b24a1a7b7d9a2a0330bbfe5b3a0::SimpleStorage::set_value",
        functionArguments: [argument],
      },
    });

    const transaction = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: rawtransaction,
    });

    await aptos.waitForTransaction({
      transactionHash: transaction.hash,
    });

    const value = await aptos.view({
      payload: {
        function:
          "e699e1882aaf75a5130f5aa6af68446aa3819b24a1a7b7d9a2a0330bbfe5b3a0::SimpleStorage::get_value",
        functionArguments: [sender.accountAddress],
      },
    });

    expect(value.length).to.be.equal(1);
    expect(Number(value[0])).to.be.equal(argument);
  });
});
