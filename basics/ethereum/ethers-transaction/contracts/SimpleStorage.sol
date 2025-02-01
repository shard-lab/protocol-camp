// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SimpleStorage {
    uint256 private storedValue;

    // Function to set a value
    function set(uint256 value) public {
        storedValue = value;
    }

    // Function to get the stored value
    function get() public view returns (uint256) {
        return storedValue;
    }
}
