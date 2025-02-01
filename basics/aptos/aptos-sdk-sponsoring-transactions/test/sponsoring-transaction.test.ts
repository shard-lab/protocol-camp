import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { expect } from "chai";

describe("#Aptos Sponsoring Transactions Hands-on Session", function () {
  this.timeout(10000);
  const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));
  const destination = Account.generate();
  let sender: Account;
  let sponsor: Account;

  before(async () => {
    sender = Account.generate();
    await aptos.fundAccount({
      accountAddress: sender.accountAddress,
      amount: 1_000_100, // 100 for transfer
    });

    sponsor = Account.generate();
    await aptos.fundAccount({
      accountAddress: sponsor.accountAddress,
      amount: 1_000_000,
    });
  });

  it("Send APT tokens from sender to receiver using a sponsoring transaction", async () => {
    //
    // Implement Here
    //
    //

    expect(
      await aptos.getAccountAPTAmount({ accountAddress: sender.accountAddress })
    ).to.be.equal(1_000_000);
    expect(
      await aptos.getAccountAPTAmount({
        accountAddress: destination.accountAddress,
      })
    ).to.be.equal(100);
  });
});
