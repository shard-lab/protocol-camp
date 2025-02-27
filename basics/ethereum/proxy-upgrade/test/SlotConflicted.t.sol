// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Proxy.sol";
import "../src/v1/GuardianStorage.sol";
import "../src/v1/ConflictedStorage.sol";
import "../src/v2/EIP1967Storage.sol";

contract SlotConflictedTest is Test {
  address public constant PROXY_ADMIN = address(0x2025);

  function test_WhenSlotConflicted_SetCounter() public {
    // Deploy the ConflictedStorage implementation
    ConflictedStorage impl = new ConflictedStorage();

    vm.prank(address(PROXY_ADMIN));
    Proxy proxy = new Proxy(address(impl));

    // Cast proxy to ConflictedStorage to interact with it
    ConflictedStorage conflictedStorage = ConflictedStorage(address(proxy));

    // Set counter to a non-zero value
    // This will overwrite the admin address in the proxy since they share the same storage slot
    conflictedStorage.setCounter(999);

    // Verify counter and admin were set to 999
    assertEq(conflictedStorage.counter(), 999, "Counter should be 999");
    // The counter variable shares the same storage slot as the _admin variable,
    // so setting the counter value overwrites the proxy's admin address
    assertEq(uint256(uint160(proxy.getAdmin())), 999, "Admin address should be 999");
  }

  /**
   * @dev Tests that GuardianStorage implementation properly avoids storage slot conflicts
   * @notice This test verifies that the GuardianStorage contract doesn't overwrite proxy admin
   * when setting counter values, unlike the ConflictedStorage contract
   */
  function test_WhenSlotConflictResolved_SetCounter() public {
    // Deploy the GuardianStorage implementation
    GuardianStorage impl = new GuardianStorage();

    // Create a proxy with the GuardianStorage implementation
    // The PROXY_ADMIN address will be set as the admin of the proxy
    vm.prank(address(PROXY_ADMIN));
    Proxy proxy = new Proxy(address(impl));

    // Cast proxy to GuardianStorage to interact with it through the proxy
    GuardianStorage guardianStorage = GuardianStorage(address(proxy));

    // Set counter to 999 - this should NOT affect the admin address
    // because GuardianStorage is designed to avoid storage slot conflicts
    guardianStorage.setCounter(999);

    // Verify counter was set correctly
    assertEq(guardianStorage.counter(), 999, "Counter should be 999");

    // Verify admin address remains unchanged
    // This confirms there's no storage slot conflict between counter and admin
    assertEq(proxy.getAdmin(), PROXY_ADMIN, "Admin Should be '0x2025");
  }
}
