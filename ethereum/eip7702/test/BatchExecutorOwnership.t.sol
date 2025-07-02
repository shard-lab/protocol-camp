// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BatchExecutor.sol";

/**
 * @title BatchExecutorOwnershipTest
 * @dev Test suite for BatchExecutor ownership and guardian access control
 * @notice Tests that only the EOA owner and authorized guardians can execute batch operations
 * @notice IMPORTANT: DO NOT MODIFY THESE TESTS
 */
contract BatchExecutorOwnershipTest is Test {
  BatchExecutor public implementation; // BatchExecutor implementation contract
  Vm.Wallet eoa = vm.createWallet("eoa"); // EOA that will have BatchExecutor code set via EIP-7702

  address public to = makeAddr("to"); // Target address for test transactions
  address public guardian1 = makeAddr("guardian1"); // First guardian address
  address public guardian2 = makeAddr("guardian2"); // Second guardian address

  /**
   * @dev Set up test environment with BatchExecutor delegation and guardian initialization
   * @notice Deploys BatchExecutor, sets up EIP-7702 delegation, and initializes guardians
   * @notice IMPORTANT: DO NOT MODIFY THESE TEST
   */
  function setUp() public {
    // Deploy the BatchExecutor implementation contract
    implementation = new BatchExecutor();

    // Fund the EOA and test contract with ETH for testing purposes
    vm.deal(eoa.addr, 10 ether);
    vm.deal(address(this), 10 ether);

    // EIP-7702: Set the BatchExecutor code to the EOA
    // This simulates the EIP-7702 delegation where an EOA can have contract code
    vm.signAndAttachDelegation(address(implementation), eoa.privateKey);

    // Create array of guardian addresses for initialization
    address[] memory guardians = new address[](2);
    guardians[0] = guardian1;
    guardians[1] = guardian2;

    // Initialize the BatchExecutor with guardian addresses using EOA as caller
    vm.prank(eoa.addr);
    BatchExecutor(payable(eoa.addr)).initialize(guardians);
  }

  /**
   * @dev Tests that only the EOA owner can execute batch operations
   * @notice Verifies that unauthorized users cannot execute batches while the owner can
   * @notice This test ensures proper access control for the EOA owner
   * @notice IMPORTANT: DO NOT MODIFY THESE TEST
   */
  function test_OnlyOwner_ExecuteBatch() public {
    // Create a single batch operation for testing
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](1);

    // Set up operation to transfer 1 ether to target address
    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: 1 ether, data: ""});

    // Test that a random address cannot execute batch operations
    address randomUser = makeAddr("randomUser");
    vm.deal(randomUser, 1 ether); // Fund the random user for testing

    // Attempt to execute batch as unauthorized user - should fail
    vm.prank(randomUser);
    vm.expectRevert(); // Should revert when called by unauthorized user
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Test that the EOA owner can successfully execute batch operations
    vm.prank(eoa.addr);
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Verify the transaction succeeded by checking balance changes
    assertEq(to.balance, 1 ether);
  }

  /**
   * @dev Tests that guardian1 can execute batch operations
   * @notice Verifies that the first authorized guardian can successfully execute batch transactions
   * @notice This test ensures guardian access control is working properly
   * @notice IMPORTANT: DO NOT MODIFY THESE TEST
   */
  function test_WhenGuardian1_ExecuteBatch() public {
    // Create a single batch operation with 2 ether transfer
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](1);

    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: 2 ether, data: ""});

    // Record initial balances before execution
    uint256 initialToBalance = to.balance;
    uint256 initialEoaBalance = eoa.addr.balance;

    // Test that guardian1 can execute batch operations
    vm.prank(guardian1);
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Verify the transaction succeeded by checking balance changes
    assertEq(to.balance, initialToBalance + 2 ether);
    assertEq(eoa.addr.balance, initialEoaBalance - 2 ether);
  }

  /**
   * @dev Tests that guardian2 can execute batch operations
   * @notice Verifies that the second authorized guardian can successfully execute batch transactions
   * @notice This test ensures multiple guardians can have access
   * @notice IMPORTANT: DO NOT MODIFY THESE TEST
   */
  function test_WhenGuardian2_ExecuteBatch() public {
    // Create a single batch operation with 1.5 ether transfer
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](1);

    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: 1.5 ether, data: ""});

    // Record initial balances before execution
    uint256 initialToBalance = to.balance;
    uint256 initialEoaBalance = eoa.addr.balance;

    // Test that guardian2 can also execute batch operations
    vm.prank(guardian2);
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Verify the transaction succeeded by checking balance changes
    assertEq(to.balance, initialToBalance + 1.5 ether);
    assertEq(eoa.addr.balance, initialEoaBalance - 1.5 ether);
  }

  /**
   * @dev Tests that non-guardian addresses cannot execute batch operations
   * @notice Verifies that unauthorized addresses (non-guardians) are properly rejected
   * @notice This test ensures access control prevents unauthorized execution
   * @notice IMPORTANT: DO NOT MODIFY THESE TEST
   */
  function testRevert_WhenNonGuardian_ExecuteBatch() public {
    // Create a single batch operation for testing unauthorized access
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](1);

    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: 1 ether, data: ""});

    // Create a non-guardian address that should not have access
    address nonGuardian = makeAddr("nonGuardian");

    // Attempt to execute batch as non-guardian - should fail
    vm.prank(nonGuardian);
    vm.expectRevert(); // Should revert when called by non-guardian
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);
  }
}
