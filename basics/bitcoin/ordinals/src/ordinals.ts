import * as crypto from "crypto";

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

export type PubKey = string;

export enum OpCode {
  OP_CHECKSIG = "OP_CHECKSIG",
  OP_FALSE = "OP_FALSE",
  OP_IF = "OP_IF",
  OP_ENDIF = "OP_ENDIF",
}

export interface Satoshi {
  id: number;
}

export class UTXO {
  public id: string;
  public ownerPubKey: PubKey;
  public satoshis: Satoshi[];
  public lockingScript: string;

  constructor(satoshis: Satoshi[], owner: PubKey, script: string) {
    this.id = crypto.randomUUID();
    this.satoshis = satoshis;
    this.ownerPubKey = owner;
    this.lockingScript = script;
  }
}

export class Node {
  private utxos: UTXO[] = [];

  private buildScript(pubKey: PubKey, dataField?: string): string {
    if (!dataField) {
      return OpCode.OP_CHECKSIG;
    } else {
      return `
        ${OpCode.OP_CHECKSIG}
        ${OpCode.OP_FALSE}
        ${OpCode.OP_IF}
          ${dataField}
        ${OpCode.OP_ENDIF}
      `.trim();
    }
  }

  private createUTXO(sats: Satoshi[], owner: PubKey, script: string) {
    const utxo = new UTXO(sats, owner, script);
    this.utxos.push(utxo);
    return utxo;
  }
  
  private registerLeftover(sats: Satoshi[], owner: PubKey) {
    if (sats.length > 0) {
      const script = this.buildScript(owner);
      this.createUTXO(sats, owner, script);
    }
  }

  private consumeUTXO(utxoId: string, pubKey: PubKey, selectedSatIds?: number[]) {
    const idx = this.utxos.findIndex(u => u.id === utxoId);
    if (idx < 0) {
      throw new Error(`UTXO not found: ${utxoId}`);
    }
    const utxo = this.utxos[idx];
    if (utxo.ownerPubKey !== pubKey) {
      throw new Error("Signature mismatch!");
    }
    this.utxos.splice(idx, 1);

    if (!selectedSatIds || selectedSatIds.length === 0) {
      return {
        consumedSats: utxo.satoshis,
        leftoverSats: [],
        oldScript: utxo.lockingScript,
        oldOwner: utxo.ownerPubKey,
      };
    }

    const consumed: Satoshi[] = [];
    const leftover: Satoshi[] = [];
    for (const s of utxo.satoshis) {
      if (selectedSatIds.includes(s.id)) {
        consumed.push(s);
      } else {
        leftover.push(s);
      }
    }
    if (consumed.length !== selectedSatIds.length) {
      throw new Error("Some selected satoshis not found in the UTXO");
    }
    return {
      consumedSats: consumed,
      leftoverSats: leftover,
      oldScript: utxo.lockingScript,
      oldOwner: utxo.ownerPubKey,
    };
  }

  public mineBlock(pubKey: PubKey) {
    const sats: Satoshi[] = [];
    for (let i = 0; i < 50; i++) {
      sats.push({ id: i });
    }
    const script = this.buildScript(pubKey);
    return this.createUTXO(sats, pubKey, script);
  }

  public listUTXOs() {
    return [...this.utxos];
  }

  public createTransferTx(params: {
    inputUtxoId: string,
    spenderPubKey: PubKey,
    newOwnerPubKey: PubKey,
    selectedSatIds?: number[]
  }) {
    const { inputUtxoId, spenderPubKey, newOwnerPubKey, selectedSatIds } = params;
    const { consumedSats, leftoverSats, oldScript, oldOwner } =
      this.consumeUTXO(inputUtxoId, spenderPubKey, selectedSatIds);

    let newScript = OpCode.OP_CHECKSIG.toString();
    if (oldScript.includes("HASH:")) {
      newScript = oldScript;
    }

    const newUtxo = this.createUTXO(consumedSats, newOwnerPubKey, newScript);
    this.registerLeftover(leftoverSats, oldOwner);

    return newUtxo;
  }

  public createCommitTx(params: {
    inputUtxoId: string,
    spenderPubKey: PubKey,
    hiddenContent: string,
    selectedSatIds?: number[]
  }) {
    const { inputUtxoId, spenderPubKey, hiddenContent, selectedSatIds } = params;
    const { consumedSats, leftoverSats, oldOwner } =
      this.consumeUTXO(inputUtxoId, spenderPubKey, selectedSatIds);

    const hashVal = sha256Hex(hiddenContent);
    const dataField = `HASH:${hashVal}`;
    const commitScript = this.buildScript(spenderPubKey, dataField);
    const commitUtxo = this.createUTXO(consumedSats, spenderPubKey, commitScript);
    this.registerLeftover(leftoverSats, oldOwner);
    return commitUtxo;
  }

  public createRevealTx(params: {
    commitUtxoId: string,
    spenderPubKey: PubKey,
    actualContent: string,
    selectedSatIds?: number[]
  }) {
    const { commitUtxoId, spenderPubKey, actualContent, selectedSatIds } = params;
    const { consumedSats, leftoverSats, oldScript, oldOwner } =
      this.consumeUTXO(commitUtxoId, spenderPubKey, selectedSatIds);

    const match = oldScript.match(/HASH:(\w+)/);
    if (!match) {
      throw new Error("Not a commit script or missing HASH:");
    }
    const commitHash = match[1];
    const contentHash = sha256Hex(actualContent);
    if (contentHash !== commitHash) {
      throw new Error("Content mismatch with commit!");
    }

    const revealField = `"${actualContent}"`;
    const revealScript = this.buildScript(oldOwner, revealField);
    const revealUtxo = this.createUTXO(consumedSats, oldOwner, revealScript);
    this.registerLeftover(leftoverSats, oldOwner);

    return revealUtxo;
  }
}
