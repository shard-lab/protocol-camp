// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Proxy Contract
 * @dev This contract implements the proxy pattern to create upgradeable smart contracts.
 * All function calls are delegated to the current implementation contract.
 */
contract Proxy {
  // Address of the proxy contract administrator
  // [slot #0]
  address private _admin;
  // Address of the contract containing the actual logic implementation
  // [slot #1]
  address private _implementation;

  /**
   * @dev Initializes the proxy contract
   * @param initImpl Address of the initial implementation contract
   */
  constructor(address initImpl) {
    _admin = msg.sender;
    _implementation = initImpl;
  }

  /**
   * @dev Fallback function - executes when a function call doesn't match any other function
   * @notice This function delegates all calls to the implementation contract
   *
   * What is delegatecall?
   * - delegatecall is a special type of message call in Ethereum
   * - It executes the code of another contract (implementation) in the context of the proxy contract
   * - This means it uses the proxy's storage, msg.sender and msg.value
   * - Perfect for proxy patterns as it maintains the state in the proxy while using logic from implementation
   *
   * How the fallback works:
   * 1. calldatacopy: Copies the transaction input data to memory
   * 2. delegatecall: Delegates the call to implementation contract
   * 3. returndatacopy: Copies the return data to memory
   * 4. Handles success/failure of the delegated call
   *
   * When is fallback called?
   * - When someone calls a function that doesn't exist in the proxy
   * - This allows the proxy to "forward" all calls to the implementation
   */
  fallback() external payable {
    assembly {
      // Copy the complete calldata to memory at position 0
      calldatacopy(0, 0, calldatasize())
      // Execute delegatecall and store success/failure in result
      let result := delegatecall(gas(), sload(_implementation.slot), 0, calldatasize(), 0, 0)
      // Copy the returned data to memory
      returndatacopy(0, 0, returndatasize())

      switch result
      case 0 {
        // If the call failed, revert with returned data
        revert(0, returndatasize())
      }
      default {
        // If the call succeeded, return the data
        return(0, returndatasize())
      }
    }
  }

  /**
   * @dev Upgrades to a new implementation contract
   * @param newImpl Address of the new implementation contract
   */
  function upgradeTo(address newImpl) external {
    require(msg.sender == _admin, "Only admin can upgrade");
    _implementation = newImpl;
  }

  /**
   * @dev Upgrades to a new implementation and calls an initialization function
   * @param newImpl Address of the new implementation contract
   * @param initData Initialization function call data
   */
  function upgradeToAndInitialize(address newImpl, bytes calldata initData) external {
    require(msg.sender == _admin, "Only admin can upgrade");
    _implementation = newImpl;

    if (initData.length > 0) {
      (bool success, ) = newImpl.delegatecall(initData);
      require(success, "Initialization failed");
    }
  }

  /**
   * @dev Returns the address of the current implementation contract
   */
  function getImplementation() external view returns (address) {
    return _implementation;
  }

  /**
   * @dev Returns the address of the current admin
   */
  function getAdmin() external view returns (address) {
    return _admin;
  }
}
