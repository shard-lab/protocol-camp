// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EIP1967Storage
 * @dev Version 2: A storage contract implementing EIP-1967 standard for proxy storage slots
 * @notice This contract uses standardized storage slots to avoid conflicts with proxy contracts
 * @dev Follows EIP-1967 specification for proxy storage slot allocation
 */
contract EIP1967Storage {
  // Define the storage structure for owner and counter data
  address private _adminGuardian;
  address private _implementationGuardian;
  uint256 public counter;

  /**
   * @dev Fixed storage slot for the EIP1967 data
   * This follows the EIP-1967 pattern for proxy storage slots
   */
  bytes32 private constant OWNER_STORAGE_SLOT =
    0x9c7aa33cf2b244f0a28ca0d25221ba71a8cac1a22c6fb8c535549b713eb09a00;

  /**
   * @dev Initializes the contract by setting the owner
   * @param owner_ The address that will be set as the initial owner
   * @notice Can only be called once when owner is not set
   * @dev The owner will have special privileges to modify storage values
   */
  function initialize(address owner_) public {
    require(_getOwner() == address(0), "Already initialized");
    _setOwner(owner_);
  }

  /**
   * @dev Modifier to restrict function access to contract owner only
   */
  modifier onlyOwner() {
    require(msg.sender == _getOwner(), "Not the owner");
    _;
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a new owner
   * @param owner_ The address to transfer ownership to
   */
  function setOwner(address owner_) public onlyOwner {
    _setOwner(owner_);
  }

  /**
   * @dev Sets the counter value, multiplied by 2. Only callable by owner
   * @param value The new value to set (will be multiplied by 2)
   */
  function setCounter(uint256 value) public onlyOwner {
    counter = value;
  }

  /**
   * @dev Returns the current owner address
   */
  function owner() public view returns (address) {
    return _getOwner();
  }

  /**
   * @dev Internal function to set the contract owner
   * @param owner_ The address to set as the new owner
   * @notice This function uses EIP-1967 storage slot for owner to avoid storage conflicts
   */
  function _setOwner(address owner_) private {
    // Use EIP-1967 storage slot for owner
    // TODO: Implement this function using assembly to store the owner address in the EIP-1967 slot
  }

  /**
   * @dev Internal function to get the current contract owner
   * @return The address of the current owner
   * @notice This function uses EIP-1967 storage slot for owner to avoid storage conflicts
   */
  function _getOwner() private view returns (address) {
    // Use EIP-1967 storage slot for owner
    // TODO: Implement this function using assembly to load the owner address from the EIP-1967 slot
    return address(0);
  }
}
