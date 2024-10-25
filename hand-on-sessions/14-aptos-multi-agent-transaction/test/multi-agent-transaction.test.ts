import {
  Account,
  Aptos,
  AptosConfig,
  MoveValue,
  Network,
} from "@aptos-labs/ts-sdk";
import { expect } from "chai";

describe("#Aptos Multi Agent Transactions Hands-on Session", function () {
  this.timeout(10000);
  const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
  const moduleAddress =
    "0xe699e1882aaf75a5130f5aa6af68446aa3819b24a1a7b7d9a2a0330bbfe5b3a0";
  let signer: Account;
  let cosigner: Account;
  let initialValue: number;

  before(async () => {
    signer = Account.generate();
    await aptos.fundAccount({
      accountAddress: signer.accountAddress,
      amount: 100_000_100,
    });

    cosigner = Account.generate();
    await aptos.fundAccount({
      accountAddress: cosigner.accountAddress,
      amount: 100_000_000,
    });

    // init counter value to zero
    const rawtransaction = await aptos.transaction.build.simple({
      sender: signer.accountAddress,
      data: {
        function: `${moduleAddress}::MultSignerCounter::init_counter`,
        functionArguments: [cosigner.accountAddress],
      },
    });

    const transaction = await aptos.signAndSubmitTransaction({
      signer: signer,
      transaction: rawtransaction,
    });

    await aptos.waitForTransaction({
      transactionHash: transaction.hash,
    });

    const value = await aptos.view({
      payload: {
        function: `${moduleAddress}::MultSignerCounter::get`,
        functionArguments: [signer.accountAddress],
      },
    });

    initialValue = Number(value[0]);
  });

  it("Count Up using a multi-agent Transaction", async () => {
    //
    //
    // Implement
    //
    //

    const value = await aptos.view({
      payload: {
        function: `${moduleAddress}::MultSignerCounter::get`,
        functionArguments: [signer.accountAddress],
      },
    });

    expect(initialValue + 1).to.be.equal(Number(value[0]));
  });
});
