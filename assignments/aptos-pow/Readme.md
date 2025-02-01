# Proof-of-Work Challenge Assignment

## 1. Overview

This assignment involves solving a Proof-of-Work (PoW) challenge implemented in a Move module. The module presents three levels of difficulty—**Easy**, **Normal**, and **Hard**—each offering a chance to claim APT rewards by finding a valid `nonce` that satisfies specific conditions. Participants can attempt to solve any of the challenges to earn rewards before others do.

## 2. Challenge Description

The module provides three main functions that participants can interact with:

1. **`proof_of_easy_work`**
2. **`proof_of_normal_work`**
3. **`proof_of_hard_work`**

Each function requires you to find a `nonce` that satisfies a specific proof-of-work condition. Successfully finding a valid `nonce` allows you to claim the associated APT reward:

- **Easy Challenge**: Claim **2 APT**
- **Normal Challenge**: Claim **3 APT**
- **Hard Challenge**: Claim **10 APT**

**Note**: Once a challenge is solved by someone, it cannot be claimed again by others.

### Viewing Challenge Status

You can check if a challenge has already been solved using the following view functions:

- `get_easy_solved_status()`
- `get_normal_solved_status()`
- `get_hard_solved_status()`

If the function returns `option::none`, the challenge is still open. Otherwise, it returns the address of the solver.

## 3. How to Participate

### Step 1: Understand the Proof-of-Work Mechanism

- **Difficulty Levels**:

  - **Easy**: Requires finding a `nonce` where the hash has at least **2 leading zero bytes**.
  - **Normal**: Requires finding a `nonce` where the hash has at least **3 leading zero bytes**.
  - **Hard**: Requires finding a `nonce` where the hash has at least **4 leading zero bytes**.

### Step 2: Set Up Your Environment

- Ensure you have the Move development environment set up and access to the Aptos network where the module is deployed.

### Step 3: Check Challenge Status

Before attempting a challenge, check if it has already been solved:

```move
let easy_status = pow::get_easy_solved_status();
let normal_status = pow::get_normal_solved_status();
let hard_status = pow::get_hard_solved_status();
```

If the status is `option::none`, the challenge is still available.

### Step 4: Find a Valid Nonce

- **Write a Script or Program**:

  - You can write a script in your preferred programming language to iterate over possible `nonce` values.
  - Use the hashing algorithms specified in the module to check if the `nonce` satisfies the difficulty condition.

- **Testing the Nonce**:

  - For the **Normal Challenge**, remember that it uses an additional hash step.
  - Ensure your script mimics the `verify_proof_with_hashed` function logic.

### Step 5: Submit Your Solution

- **Ensure You Have Enough Gas**: Make sure your account has enough balance to cover the transaction fees.

### Step 6: Verify Your Reward

- After successfully submitting the valid `nonce`, check your account balance to confirm that you have received the APT reward.
- Use your wallet or account explorer tools to verify the transaction.

## 4. Additional Notes

- **One-Time Claim**: Each challenge can only be claimed once. After it's solved, others cannot claim the reward.
- **Error Handling**:

  - **Challenge Already Solved**: If you attempt to solve a challenge that has already been completed, the transaction will abort with an `already_exists` error.
  - **Invalid Nonce**: Providing an incorrect `nonce` will result in an `invalid_argument` error.

- **Understanding the Hashing Process**:

  - The module uses SHA-256 hashing.
  - For the **Easy** and **Hard** challenges, the hash is computed on `CHALLENGE` concatenated with the string representation of `nonce`.
  - For the **Normal** challenge, both the `CHALLENGE` and the `nonce` are hashed individually before being concatenated and hashed again.

## 5. Conclusion

By participating in this hands-on session, you will:

- Gain practical experience with **Proof-of-Work algorithms**.
- Enhance your skills in **Move programming** and blockchain interactions.
- Develop problem-solving strategies for cryptographic challenges.
