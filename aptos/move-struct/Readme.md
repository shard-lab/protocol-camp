# Resource and Structs Hands-on Session

## 1. Overview

This hands-on session focuses on implementing and testing resource and struct management in Move. You will learn how to create, modify, view, and delete resources in global storage, as well as understand the use of different struct capabilities (`drop`, `copy`, and `key`). The session is divided into two modules: `protocol::resource` for resource management and `protocol::structability` for demonstrating struct capabilities.

## 2. Test Description

The project includes test modules (`protocol::resource_test` and `protocol::structability_test`) to verify the correct implementation of the resource and struct functionalities.

### Resource Management Test Cases (`protocol::resource_test`):

1. **Create Resource (`test_create_resource`)**:

   - Verifies that a resource can be created and published to global storage.

2. **Modify Resource (`test_modify_resource`)**:

   - Ensures that a resource’s value can be modified and that the modification is reflected when viewed.

3. **Reference Rules (`test_reference_rules`)**:

   - Validates that a resource can be viewed and then modified while maintaining proper reference and borrowing rules.

4. **Delete Resource (`test_delete_resource`)**:
   - Checks that a resource can be deleted from global storage.

### Struct Capability Test Cases (`protocol::structability_test`):

1. **Drop Capability (`test_drop`)**:

   - Verifies that a struct with `drop` capability can be dropped without issues.

2. **Copy Capability (`test_copy`)**:

   - Ensures that a struct with `copy` capability can be copied, allowing multiple references in code.

3. **Key Capability (`test_key`)**:

   - Tests that a struct with `key` capability can be stored in global storage.

4. **Store with Nested Struct (`test_store`)**:
   - Verifies that a struct containing another struct can be stored in global storage.

## 3. How to Run Tests

1. Ensure your Move development environment is set up and the `aptos` CLI is installed.

2. Navigate to your project directory in the terminal.

3. Run the tests with the following command:
   ```bash
   aptos move test
   ```
   This command will execute the test cases in `protocol::resource_test` and `protocol::structability_test` and display the results.

## 4. What to Implement

Your task is to complete the functions in the `protocol::resource` and `protocol::structability` modules to ensure all test cases pass. Below are descriptions of each function:

### `protocol::resource` Module:

- **Create Resource (`create_resource`)**:

  - **Description**: Publishes a `Counter` resource to global storage using the given `account` and initial `value`.
  - **Expected Behavior**: The resource should be stored at the given account’s address.

- **Modify Resource (`modify_resource`)**:

  - **Description**: Modifies the `Counter` resource at the specified `addr` to set a new `value`.
  - **Expected Behavior**: The resource should be updated in place, and the new value should be visible when viewed.

- **View Resource (`view_resource`)**:

  - **Description**: Retrieves the current `value` of the `Counter` resource at the specified `addr`.
  - **Expected Behavior**: The function should return the current value stored in the resource.

- **Delete Resource (`delete_resource`)**:
  - **Description**: Removes the `Counter` resource from the specified `addr`.
  - **Expected Behavior**: The resource should no longer exist at the given address after deletion.

### `protocol::structability` Module:

- **Drop Capability (`drop`)**:

  - **Description**: Demonstrates the `drop` capability of a struct by creating and dropping an instance of `DropStruct`.

- **Copy Capability (`copy_`)**:

  - **Description**: Verifies the `copy` capability by creating an instance of `CopyStruct` and copying it.

- **Key Capability (`key`)**:

  - **Description**: Demonstrates the `key` capability by creating a `KeyStruct` and moving it into global storage.

- **Store with Nested Struct (`store`)**:
  - **Description**: Demonstrates storing a `Resource` struct containing a nested `StoreStruct` in global storage.

## 5. Additional Notes

- **Resource Management**: Move’s resource model ensures safety and ownership, which means resources can only exist in one place at a time and are not copyable by default.
- **Struct Capabilities**: Understanding `drop`, `copy`, and `key` capabilities helps you control how structs behave in terms of copying, dropping, and global storage.
- **Testing Code**: The provided tests in the `tests/` folder will verify that your implementations work correctly and handle common scenarios.

Completing this hands-on session will give you practical experience with resource management, struct capabilities, and how to implement and test them in Move.
