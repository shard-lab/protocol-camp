import { Account, Aptos, AptosConfig, MoveValue, Network } from "@aptos-labs/ts-sdk";
import { expect } from "chai";

describe("#Aptos Multi Agent Transactions Hands-on Session", function () {
  this.timeout(10000);
  const aptos = new Aptos(new AptosConfig({ network: Network.TESTNET }));
  const moduleAddress = "0xe699e1882aaf75a5130f5aa6af68446aa3819b24a1a7b7d9a2a0330bbfe5b3a0";
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
    const transaction = await aptos.transaction.build.multiAgent({
      sender: signer.accountAddress,
      secondarySignerAddresses: [cosigner.accountAddress],
      data: {
        function: `${moduleAddress}::MultSignerCounter::up`,
        functionArguments: [],
      },
    });

    const signertransaction = aptos.transaction.sign({
      signer: signer,
      transaction,
    });

    const cosignertransaction = aptos.transaction.sign({
      signer: cosigner,
      transaction,
    });

    const committedTransaction = await aptos.transaction.submit.multiAgent({
      transaction,
      senderAuthenticator: signertransaction,
      additionalSignersAuthenticators: [cosignertransaction],
    });

    console.log("\n=== 5. Waiting for result of transaction ===\n");
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    const value = await aptos.view({
      payload: {
        function: `${moduleAddress}::MultSignerCounter::get`,
        functionArguments: [signer.accountAddress],
      },
    });

    expect(initialValue + 1).to.be.equal(Number(value[0]));
  });
});
