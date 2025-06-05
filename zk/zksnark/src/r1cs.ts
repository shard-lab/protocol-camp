/**
 * Vector class extending Array to provide mathematical operations
 * Used to represent vectors in the R1CS constraint system
 */
export class Vector extends Array<number> {
  /**
   * Computes the inner product (dot product) of this vector with another vector
   * @param other - The vector to compute the inner product with
   * @returns The inner product result
   */
  innerProduct(other: Vector): number {
    return this.reduce((sum, val, i) => sum + val * other[i], 0);
  }
}

/**
 * Rank-1 Constraint System (R1CS) class
 * Represents a single constraint in the form A·w * B·w = C·w
 * where w is the witness vector and A, B, C are coefficient vectors
 */
export class R1CS {
  /** Vector of coefficients for the left-hand side of the constraint */
  public A: Vector;
  /** Vector of coefficients for the right-hand side of the constraint */
  public B: Vector;
  /** Vector of coefficients for the output of the constraint */
  public C: Vector;

  /**
   * Creates a new R1CS constraint
   * @param A - Vector of coefficients for the left-hand side
   * @param B - Vector of coefficients for the right-hand side
   * @param C - Vector of coefficients for the output
   */
  constructor(A?: Vector, B?: Vector, C?: Vector) {
    this.A = A ?? new Vector();
    this.B = B ?? new Vector();
    this.C = C ?? new Vector();
  }

  /**
   * Evaluates the constraint against a witness vector
   * Checks if (A·w) * (B·w) = (C·w)
   * @param witness - The witness vector containing the circuit values
   * @returns True if the constraint is satisfied, false otherwise
   */
  evaluate(witness: Vector): boolean {
    const aEval = this.A.innerProduct(witness);
    const bEval = this.B.innerProduct(witness);
    const cEval = this.C.innerProduct(witness);
    return aEval * bEval === cEval;
  }
}

/**
 * R1CS System class representing a collection of R1CS constraints
 * Used to model an entire arithmetic circuit as a system of constraints
 */
export class R1CSSystem {
  /** Array of R1CS constraints that make up the system */
  public constraints: R1CS[] = [];

  /**
   * Adds a new constraint to the system
   * @param A - Vector of coefficients for the left-hand side
   * @param B - Vector of coefficients for the right-hand side
   * @param C - Vector of coefficients for the output
   */
  addConstraint(A: Vector, B: Vector, C: Vector): void {
    this.constraints.push(new R1CS(A, B, C));
  }

  /**
   * Evaluates all constraints in the system against a witness vector
   * @param witness - The witness vector containing all circuit values
   * @returns True if all constraints are satisfied, false otherwise
   */
  evaluate(witness: Vector): boolean {
    return this.constraints.every((constraint, _) => {
      const result = constraint.evaluate(witness);
      return result;
    });
  }
}
