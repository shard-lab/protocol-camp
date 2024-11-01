# Basic Arithmetic Module Hands-on Session

## 1. Overview

This hands-on session focuses on implementing basic arithmetic operations and utility functions in Move, a language used on the Aptos blockchain. You will complete the `protocol::basic` module to pass all the provided test cases. This module includes functions for addition, subtraction, multiplication, division, modulus, finding the maximum and minimum of two numbers, and checking if a number is even.

## 2. Test Description

The project includes a test module (`protocol::basic_test`) with various test cases to validate the correct implementation of each function in `protocol::basic`.

### Test Cases Included:

1. **Addition (`add`)**: Verifies that the sum of two numbers is correct.
2. **Subtraction (`minus`)**: Checks that the difference between two numbers is correct.
3. **Multiplication (`multiply`)**: Ensures that the product of two numbers is computed correctly.
4. **Division (`div`)**: Validates that the quotient of two numbers is returned correctly.
5. **Division by Zero (`div`)**: Ensures that attempting to divide by zero results in failure.
6. **Modulus (`mod`)**: Checks that the remainder of division is correct.
7. **Modulus by Zero (`mod`)**: Ensures that attempting to compute the remainder with a divisor of zero fails.
8. **Maximum (`max`)**: Confirms that the maximum of two numbers is returned.
9. **Minimum (`min`)**: Verifies that the minimum of two numbers is returned.
10. **Even Check (`is_even`)**: Tests if a number is even.

## 3. How to Run Tests

1. Ensure your Move development environment is set up and the `aptos` CLI is installed.

2. Navigate to your project directory in the terminal.

3. Run the tests with the following command:
   ```bash
   aptos move test
   ```
   This command will execute the test cases in `protocol::basic_test` and display the results.

## 4. What to Implement

Your task is to complete the functions in the `protocol::basic` module so that all the test cases pass. Below are descriptions of each function:

### Function Descriptions:

- **Addition (`add`)**: A function that returns the sum of two `u64` integers.
- **Subtraction (`minus`)**: A function that returns the difference between two `u64` integers.
- **Multiplication (`multiply`)**: A function that returns the product of two `u64` integers.
- **Division (`div`)**: A function that returns the quotient when `a` is divided by `b` and should handle division by zero by failing with an appropriate error.
- **Modulus (`mod`)**: A function that returns the remainder when `a` is divided by `b` and should fail when `b` is zero.
- **Maximum (`max`)**: A function that returns the larger of two `u64` integers.
- **Minimum (`min`)**: A function that returns the smaller of two `u64` integers.
- **Even Check (`is_even`)**: A function that checks whether a given `u64` integer is even.

## 5. Additional Notes

- **Error Handling**: The division and modulus functions should fail with appropriate error codes when dividing by zero.
- **Testing Code**: The tests in the `tests/` folder validate the behavior of each function. Ensure your implementation passes these tests.
- **Move Language Features**: Use Move's built-in operators and conditional logic to implement each function.

## Reference for Basic Syntax

For more information on basic Move syntax and operations, refer to the Aptos Move by Example documentation(https://move-developers-dao.gitbook.io/aptos-move-by-example/basic-concepts/operations). This resource provides an overview of basic operations and concepts in Move, which will be helpful for completing this session.

Completing this hands-on session will provide you with practical knowledge of basic arithmetic operations, conditional handling, and test-driven development in Move.
