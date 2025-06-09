// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuardianStorage
 * @dev Version 1: A basic storage contract that maintains a counter value
 * @notice When upgrading this contract, ensure storage layout is preserved to avoid slot conflicts
 * @dev This contract is specifically designed to demonstrate slot conflicts in proxy patterns
 */
contract GuardianStorage {
  // IMPORTANT: Storage layout must be preserved in upgraded versions to prevent slot conflicts
  // These variables are intentionally named to match the slots used by Proxy contract
  // _adminGuardian occupies the same storage slot as _admin in the Proxy contract
  // [slot #0]
  address private _adminGuardian;
  // _implementationGuardian occupies the same storage slot as _implementation in the Proxy contract
  // This demonstrates how storage slot conflicts can occur when using the proxy pattern
  // [slot #1]
  address private _implementationGuardian;

  // Counter variable to store numeric value
  // [slot #2]
  uint256 public counter;

  /**
   * @dev Sets the counter to a new value
   * @param value The new value to set for the counter
   */
  function setCounter(uint256 value) public {
    counter = value;
  }
}
