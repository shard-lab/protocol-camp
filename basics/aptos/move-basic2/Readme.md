# Loop and Vector Operations Hands-on Session

## 1. Overview

This hands-on session focuses on implementing functions that use loops and vector operations in Move. You will complete the `protocol::basic2` module to pass all the provided test cases. The module includes functions to sum numbers up to `n`, calculate the factorial of `n`, and sum the elements of a vector.

## 2. Test Description

The project includes a test module (`protocol::basic2_test`) that verifies the correct implementation of each function in `protocol::basic2`.

### Test Cases Included:

1. **Sum Up to `n` (`sum_up_to_n`)**: Tests the function that sums all numbers from 0 to `n` using a loop.
2. **Factorial Calculation (`factorial`)**: Validates that the function correctly computes the factorial of `n` using a `while` loop.
3. **Sum Vector Elements (`sum_vector_elements`)**: Checks that the function sums all elements in a given vector.

## 3. How to Run Tests

1. Ensure your Move development environment is set up and the `aptos` CLI is installed.

2. Navigate to your project directory in the terminal.

3. Run the tests with the following command:
   ```bash
   aptos move test
   ```
   This command will execute the test cases in `protocol::basic2_test` and display the results.

## 4. What to Implement

Your task is to complete the functions in the `protocol::basic2` module so that all test cases pass. Below are descriptions of each function:

### Function Descriptions:

- **Sum Up to `n` (`sum_up_to_n`)**:

  - **Description**: A function that computes the sum of all numbers from 0 to `n` using a `loop`.
  - **Expected Result**: For an input of `5`, the function should return `15` (0 + 1 + 2 + 3 + 4 + 5).

- **Factorial (`factorial`)**:

  - **Description**: A function that calculates the factorial of `n` using a `while` loop.
  - **Expected Result**: For an input of `5`, the function should return `120` (5! = 5 _ 4 _ 3 _ 2 _ 1).

- **Sum Vector Elements (`sum_vector_elements`)**:
  - **Description**: A function that sums all the elements in a given `vector<u64>`.
  - **Expected Result**: For a vector `[1, 2, 3, 4]`, the function should return `10` (1 + 2 + 3 + 4).

## 5. Additional Notes

- **Loop Structures**: Familiarize yourself with `loop` and `while` constructs in Move to implement the functions.
- **Vector Operations**: Ensure you know how to iterate over elements in a vector to sum them.
- **Error Handling**: The functions do not need to handle error cases for this session, but edge cases like `n = 0` or an empty vector should be considered.

Completing this hands-on session will give you practical experience with implementing loops, vector operations, and iterative logic in Move.
