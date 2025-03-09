import * as crypto from "crypto";
import { Bitcoin, Transaction, TxOutput, Address } from "./bitcoin";

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export function createCommitTx(params: {
  spender: Address;
  inputTxId: string;
  inputVOut: number;
  hiddenContent: string;
}): Transaction {
  const { spender, inputTxId, inputVOut, hiddenContent } = params;

  const inputOutput = Bitcoin.getTxOutput(inputTxId, inputVOut);
  if (!inputOutput) {
    throw new Error("Input UTXO not found");
  }
  if (inputOutput.address !== spender) {
    throw new Error("Signature mismatch! (Not the correct owner)");
  }

  const hashVal = sha256Hex(hiddenContent);
  const script = `HASH:${hashVal}`;

  const newOutput: TxOutput = {
    address: spender,
    amount: inputOutput.amount,
    script,
  };

  const commitTx = Transaction.create(
    [{ txId: inputTxId, vOut: inputVOut }],
    [newOutput]
  );

  Bitcoin.pendingTransactions.push(commitTx);

  return commitTx;
}

export function createRevealTx(params: {
  spender: Address;
  commitTxId: string;
  commitVOut: number;
  actualContent: string;
}): Transaction {
  const { spender, commitTxId, commitVOut, actualContent } = params;

  const commitOutput = Bitcoin.getTxOutput(commitTxId, commitVOut);
  if (!commitOutput) {
    throw new Error("Commit UTXO not found");
  }
  if (commitOutput.address !== spender) {
    throw new Error("Signature mismatch! (Not the correct owner)");
  }
  if (!commitOutput.script || !commitOutput.script.startsWith("HASH:")) {
    throw new Error("Not a valid commit script");
  }

  const commitHash = commitOutput.script.slice("HASH:".length);
  const contentHash = sha256Hex(actualContent);
  if (commitHash !== contentHash) {
    throw new Error("Content mismatch with commit!");
  }

  const revealScript = `"${actualContent}"`;

  const newOutput: TxOutput = {
    address: spender,
    amount: commitOutput.amount,
    script: revealScript,
  };

  const revealTx = Transaction.create(
    [{ txId: commitTxId, vOut: commitVOut }],
    [newOutput]
  );

  Bitcoin.pendingTransactions.push(revealTx);

  return revealTx;
}
