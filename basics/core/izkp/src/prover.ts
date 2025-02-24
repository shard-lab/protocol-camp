export class Prover {
  private x: number;
  private r: number;
  public g: number; // Generator value used for modular exponentiation
  public p: number; // Prime modulus
  public v: number; // Commitment value v = g^r mod p

  /**
   * Generates a new Prover instance with random commitment
   * @param x Secret value that the prover knows
   * @param g Generator value used for modular exponentiation
   * @param p Prime modulus
   * @returns New Prover instance with generated commitment
   */
  static generate(x: number, g: number, p: number): Prover {
    const r = Math.floor(Math.random() * 20);
    const v = Math.pow(g, r) % p;
    return new Prover(x, g, p, r, v);
  }

  constructor(x: number, g: number, p: number, r: number, v: number) {
    this.x = x;
    this.g = g;
    this.p = p;
    this.r = r;
    this.v = v;
  }

  /**
   * Generates response to verifier's challenge
   * @param b Challenge bit (0 or 1) from verifier
   * @returns Response value based on the challenge
   */
  challenge(b: number): number {
    throw new Error("Not implemented");
  }
}
