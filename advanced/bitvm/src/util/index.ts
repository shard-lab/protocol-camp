import crypto from "crypto";

export function hash(...inputs: string[]): string {
  return crypto.createHash("sha256").update(inputs.join("|")).digest("hex");
}

export function randomNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}
