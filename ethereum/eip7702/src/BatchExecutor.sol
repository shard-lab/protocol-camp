// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title BatchExecutor
 * @dev EIP-7702 delegation contract for executing batch transactions
 * @notice This contract allows EOAs to execute multiple transactions in a single batch
 */
contract BatchExecutor {
  // Event for tracking batch operations
  event BatchExecuted(uint256 batchId, uint256 operationsCount);

  // Batch transaction structure
  struct BatchTransferOperation {
    address target; // Target address for the transaction
    uint256 value; // ETH value to send
    bytes data; // Call data for the transaction
  }

  /// @dev Mapping to track guardian addresses
  mapping(address => bool) public guardians;

  /**
   * @dev Initialize the contract with guardian addresses
   * @param _guardians Array of guardian addresses to authorize
   * @notice This function sets up the initial guardians for the contract
   * @notice IMPORTANT: The function body must not be modified - this is a requirement
   */
  function initialize(address[] calldata _guardians) external {
    for (uint256 i = 0; i < _guardians.length; i++) {
      guardians[_guardians[i]] = true;
    }
  }

  /**
   * @dev Execute batch transactions using EIP-7702 delegation
   * @param operations Array of batch operations to execute
   * @notice Only owner or guardians can execute batch transactions
   * @notice IMPORTANT: The function body must not be modified - this is a requirement
   * @notice However, modifiers can be added to the function signature for access control
   */
  function executeBatch(BatchTransferOperation[] calldata operations) external payable {
    // Generate unique batch ID using current timestamp
    uint256 batchId = block.timestamp;

    // Execute each operation in the batch
    for (uint256 i = 0; i < operations.length; i++) {
      BatchTransferOperation memory op = operations[i];

      // Execute each operation in the batch
      (bool success, bytes memory result) = op.target.call{value: op.value}(op.data);

      // Revert if any operation fails with detailed error message
      require(success, string(abi.encodePacked("Batch operation ", i, " failed: ", result)));
    }

    // Emit event for successful batch execution
    emit BatchExecuted(batchId, operations.length);
  }
}
