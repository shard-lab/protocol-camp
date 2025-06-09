import * as crypto from "crypto";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

export function sha256(data: Buffer): Buffer {
  return crypto.createHash("sha256").update(data).digest();
}

export function hash160(data: Buffer): Buffer {
  return ripemd160(sha256(data));
}

function ripemd160(data: Buffer): Buffer {
  return crypto.createHash("ripemd160").update(data).digest();
}

export enum OpCode {
  OP_DUP,
  OP_HASH160,
  OP_EQUALVERIFY,
  OP_CHECKSIG,
  OP_EQUAL,
}

export type OpCodeFunction = (stack: Buffer[]) => void;

export const opCodeFunctions: { [key in OpCode]: OpCodeFunction } = {
  [OpCode.OP_DUP]: (stack) => {},
  [OpCode.OP_HASH160]: (stack) => {},
  [OpCode.OP_EQUALVERIFY]: (stack) => {},
  [OpCode.OP_CHECKSIG]: (stack) => {},
  [OpCode.OP_EQUAL]: (stack) => {},
};

export class BitcoinScriptInterpreter {
  private stack: Buffer[];

  constructor() {
    this.stack = [];
  }

  private push(data: Buffer): void {
    this.stack.push(data);
  }

  executeScript(script: (OpCode | Buffer)[]): boolean {
    for (const item of script) {
      if (typeof item === "number") {
        const opFunc = opCodeFunctions[item as OpCode];
        if (!opFunc) throw new Error("Invalid OpCode");
        opFunc(this.stack);
      } else if (Buffer.isBuffer(item)) {
        this.push(item);
      } else {
        throw new Error("Invalid script element");
      }
    }

    const result = this.stack.pop();
    if (!result || result.length !== 1) {
      throw new Error("Invalid script result");
    }

    return result[0] === 1;
  }

  static serializeScript(script: (OpCode | Buffer)[]): Buffer {
    throw new Error("Implement me!!");
  }

  static deserializeScript(script: (OpCode | Buffer)[]): (OpCode | Buffer)[] {
    throw new Error("Implement me!!");
  }
}
