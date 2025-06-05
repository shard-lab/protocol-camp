// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Proxy.sol";
import "../src/v1/GuardianStorage.sol";
import "../src/v1/ConflictedStorage.sol";
import "../src/v2/EIP1967Storage.sol";

/**
 * @title ProxyTest
 * @dev Test contract for verifying proxy upgrade functionality
 * @notice Tests the implementation of proxy pattern and storage management
 */
contract ProxyTest is Test {
  // Constants for test addresses
  address public constant PROXY_ADMIN = address(0x2025);
  address public constant STORAGE_OWNER = address(0x3035);

  // Contract instances
  Proxy proxy;
  GuardianStorage guardianStorageImpl;

  /**
   * @dev Setup function that runs before each test
   * @notice Deploys the initial implementation and proxy contract
   */
  function setUp() public {
    // Deploy the initial implementation (GuardianStorage)
    guardianStorageImpl = new GuardianStorage();

    // Deploy the proxy with GuardianStorage as implementation
    vm.prank(PROXY_ADMIN);
    proxy = new Proxy(address(guardianStorageImpl));
  }

  /**
   * @dev Tests the initialization of the proxy contract
   * @notice Verifies that implementation and admin are set correctly
   */
  function test_Initialize() public {
    // Verify the initial implementation is set correctly
    assertEq(
      proxy.getImplementation(),
      address(guardianStorageImpl),
      "Initial implementation should be GuardianStorage"
    );
    assertEq(proxy.getAdmin(), PROXY_ADMIN, "Admin should be set correctly");
  }

  /**
   * @dev Tests the counter functionality through the proxy
   * @notice Verifies that the proxy correctly delegates calls to the implementation
   */
  function test_SetCounter() public {
    GuardianStorage guardianStorage = GuardianStorage(address(proxy));
    guardianStorage.setCounter(999);
    assertEq(guardianStorage.counter(), 999, "Counter should be 999");
  }

  /**
   * @dev Tests the proxy upgrade functionality and EIP1967Storage implementation
   * This test verifies:
   * 1. Initial state with GuardianStorage
   * 2. Upgrading to EIP1967Storage
   * 3. Initializing the new implementation
   * 4. Access control for the counter functionality
   */
  function test_UpgradeTo() public {
    // PART 1: Setup and verify initial implementation (GuardianStorage)
    GuardianStorage guardianStorage = GuardianStorage(address(proxy));
    guardianStorage.setCounter(42);
    assertEq(guardianStorage.counter(), 42, "Counter should be 42");

    // PART 2: Upgrade to EIP1967Storage implementation
    EIP1967Storage eip1967StorageImpl = new EIP1967Storage();
    vm.prank(PROXY_ADMIN);
    proxy.upgradeTo(address(eip1967StorageImpl));

    // Verify the implementation was updated
    assertEq(
      proxy.getImplementation(),
      address(eip1967StorageImpl),
      "Implementation should be updated to EIP1967Storage"
    );

    // PART 3: Initialize the new implementation
    bytes memory initData = abi.encodeWithSelector(
      EIP1967Storage.initialize.selector,
      STORAGE_OWNER
    );
    vm.prank(PROXY_ADMIN);
    proxy.upgradeToAndInitialize(address(eip1967StorageImpl), initData);

    // Cast proxy to EIP1967Storage to interact with it
    EIP1967Storage eip1967Storage = EIP1967Storage(address(proxy));

    // Verify owner was set correctly
    assertEq(
      eip1967Storage.owner(),
      STORAGE_OWNER,
      "EIP1967 Storage Owner should be set to STORAGE_OWNER"
    );

    // Verify data persistence after upgrade
    assertEq(guardianStorage.counter(), 42, "Counter should remain same as 42");

    // PART 4: Test access control on the upgraded implementation
    // Test 4.1: Non-owner access (should fail)
    vm.expectRevert("Not the owner");
    vm.prank(address(0x123));
    eip1967Storage.setCounter(100);
    assertEq(eip1967Storage.counter(), 42, "Counter should remain unchanged");

    // Test 4.2: Owner access (should succeed)
    vm.prank(STORAGE_OWNER);
    eip1967Storage.setCounter(100);
    assertEq(eip1967Storage.counter(), 100, "Counter should be updated to 100");
  }
}
