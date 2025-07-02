// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BatchExecutor.sol";
import "../src/BatchExecutorV2.sol";

/**
 * @title BatchExecutorStorageLayoutTest
 * @dev Test suite for BatchExecutor storage layout compatibility during upgrades
 * @notice Tests that storage layout is preserved when upgrading from BatchExecutor to BatchExecutorV2
 * @notice IMPORTANT: DO NOT MODIFY THESE TESTS - They are designed to validate specific functionality
 */
contract BatchExecutorStorageLayoutTest is Test {
  BatchExecutor public implementation; // BatchExecutor implementation contract
  BatchExecutorV2 public implementationV2; // BatchExecutorV2 implementation contract
  Vm.Wallet eoa = vm.createWallet("eoa"); // EOA that will have BatchExecutor code set via EIP-7702

  address public to = makeAddr("to"); // Target address for test transactions
  address public guardian1 = makeAddr("guardian1"); // First guardian address
  address public guardian2 = makeAddr("guardian2"); // Second guardian address

  /**
   * @dev Set up test environment with BatchExecutor delegation and upgrade to V2
   * @notice Deploys both versions, sets up EIP-7702 delegation, initializes guardians, and upgrades
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function setUp() public {
    // Deploy both BatchExecutor implementation contracts
    implementation = new BatchExecutor();
    implementationV2 = new BatchExecutorV2();

    // Fund the EOA with ETH for testing purposes
    vm.deal(eoa.addr, 10 ether);

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

    // Upgrade to BatchExecutorV2 by changing the delegation
    vm.signAndAttachDelegation(address(implementationV2), eoa.privateKey);
  }

  /**
   * @dev Tests that the EOA owner can execute batch operations after upgrade to V2
   * @notice Verifies that the owner access control is preserved during upgrade
   * @notice This test ensures proper functionality after storage layout upgrade
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_WhenOwner_ExecuteBatch() public {
    // Create a single batch operation for testing owner access in V2
    BatchExecutorV2.BatchTransferOperation[]
      memory operations = new BatchExecutorV2.BatchTransferOperation[](1);

    // Set up operation to transfer 1 ether to target address
    operations[0] = BatchExecutorV2.BatchTransferOperation({target: to, value: 1 ether, data: ""});

    // Check initial executions count (V2 feature)
    BatchExecutorV2(payable(eoa.addr)).executions();

    // Test that the EOA owner can execute batch operations in V2
    vm.prank(eoa.addr);
    BatchExecutorV2(payable(eoa.addr)).executeBatch(operations);

    // Verify that the transfer was successful
    assertEq(to.balance, 1 ether);
    assertEq(eoa.addr.balance, 9 ether);
  }

  /**
   * @dev Tests that guardian addresses are preserved after upgrade to V2
   * @notice Verifies that the guardian mapping storage is maintained during upgrade
   * @notice This test ensures storage layout compatibility between versions
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_Guardians() public view {
    // Verify that both guardians are still authorized after upgrade
    assertTrue(BatchExecutorV2(payable(eoa.addr)).guardians(guardian1));
    assertTrue(BatchExecutorV2(payable(eoa.addr)).guardians(guardian2));
  }

  /**
   * @dev Tests that guardians can execute batch operations after upgrade to V2
   * @notice Verifies that guardian access control is preserved during upgrade
   * @notice This test ensures guardian functionality works in the upgraded version
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_WhenGuardian_ExecuteBatch() public {
    // Create a single batch operation for testing guardian access in V2
    BatchExecutorV2.BatchTransferOperation[]
      memory operations = new BatchExecutorV2.BatchTransferOperation[](1);
    operations[0] = BatchExecutorV2.BatchTransferOperation({target: to, value: 1 ether, data: ""});

    // Test that guardian1 can execute batch operations in V2
    vm.prank(guardian1);
    BatchExecutorV2(payable(eoa.addr)).executeBatch(operations);

    // Verify that the transfer was successful
    assertEq(to.balance, 1 ether);
    assertEq(eoa.addr.balance, 9 ether);
  }

  /**
   * @dev Tests the new execution counter functionality in V2
   * @notice Verifies that the executions counter properly tracks batch executions
   * @notice This test ensures the new V2 feature works correctly
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_ExecutionCounts() public {
    // Check initial executions count (should be 0 for new V2 feature)
    uint256 initialExecutions = BatchExecutorV2(payable(eoa.addr)).executions();
    assertEq(initialExecutions, 0);

    // Create batch operations for testing execution counting
    BatchExecutorV2.BatchTransferOperation[]
      memory operations = new BatchExecutorV2.BatchTransferOperation[](1);
    operations[0] = BatchExecutorV2.BatchTransferOperation({target: to, value: 1 ether, data: ""});

    // Execute first batch operation
    vm.prank(guardian1);
    BatchExecutorV2(payable(eoa.addr)).executeBatch(operations);

    // Verify executions counter incremented after first execution
    uint256 executionsAfterFirst = BatchExecutorV2(payable(eoa.addr)).executions();
    assertEq(executionsAfterFirst, initialExecutions + 1);

    // Execute second batch operation
    vm.prank(guardian2);
    BatchExecutorV2(payable(eoa.addr)).executeBatch(operations);

    // Verify executions counter incremented after second execution
    uint256 executionsAfterSecond = BatchExecutorV2(payable(eoa.addr)).executions();
    assertEq(executionsAfterSecond, initialExecutions + 2);

    // Verify that both transfers were successful
    assertEq(to.balance, 2 ether);
    assertEq(eoa.addr.balance, 8 ether);
  }

  /**
   * @dev Tests execution of multiple batch operations in V2
   * @notice Verifies that multiple operations can be executed atomically in the upgraded version
   * @notice This test ensures batch functionality is preserved and execution counter works
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_WhenMultipleOperation_ExecuteBatch() public {
    // Create multiple batch operations for testing V2 functionality
    BatchExecutorV2.BatchTransferOperation[]
      memory operations = new BatchExecutorV2.BatchTransferOperation[](2);
    operations[0] = BatchExecutorV2.BatchTransferOperation({target: to, value: 1 ether, data: ""});
    operations[1] = BatchExecutorV2.BatchTransferOperation({target: to, value: 2 ether, data: ""});

    // Record initial executions count before batch execution
    uint256 initialExecutions = BatchExecutorV2(payable(eoa.addr)).executions();

    // Execute multiple operations in a single batch
    vm.prank(guardian1);
    BatchExecutorV2(payable(eoa.addr)).executeBatch(operations);

    // Verify executions counter incremented by 1 (single batch execution)
    assertEq(BatchExecutorV2(payable(eoa.addr)).executions(), initialExecutions + 1);

    // Verify that all transfers were successful (total: 3 ether)
    assertEq(to.balance, 3 ether);
    assertEq(eoa.addr.balance, 7 ether);
  }
}
