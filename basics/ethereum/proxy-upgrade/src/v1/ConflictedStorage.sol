// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ConflictedStorage
 * @dev Version 1: A basic storage contract that intentionally creates storage slot conflicts
 * @notice This contract is deliberately designed to demonstrate storage slot conflicts in proxy patterns
 * @dev When used with a proxy, the counter variable will occupy the same slot as the proxy's admin address
 * @dev This means calling setCounter() will actually overwrite the proxy's admin address, causing critical issues
 */
contract ConflictedStorage {
  // IMPORTANT: This variable intentionally conflicts with the _admin slot in the Proxy contract
  // When setCounter is called through a proxy, it will actually modify the admin address
  // Counter variable to store numeric value
  // [slot #0]
  uint256 public counter;

  /**
   * @dev Sets the counter to a new value
   * @param value The new value to set for the counter
   * @notice WARNING: Due to storage slot conflicts, this function will actually modify the proxy's
   * admin address when called through a proxy, potentially causing loss of upgrade capability
   */
  function setCounter(uint256 value) public {
    counter = value;
  }
}
