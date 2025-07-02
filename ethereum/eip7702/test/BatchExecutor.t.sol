// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {BatchExecutor} from "../src/BatchExecutor.sol";

/**
 * @title BatchExecutorTest
 * @dev Test suite for BatchExecutor contract with EIP-7702 delegation
 * @notice IMPORTANT: DO NOT MODIFY THESE TESTS - They are designed to validate specific functionality
 */
contract BatchExecutorTest is Test {
  BatchExecutor public implementation; // BatchExecutor implementation contract
  Vm.Wallet eoa = vm.createWallet("eoa"); // EOA that will have BatchExecutor code set via EIP-7702

  address public to = makeAddr("to"); // Target address for test transactions

  function setUp() public {
    // Deploy the BatchExecutor implementation
    implementation = new BatchExecutor();

    // Fund the EOA and test contract with ETH
    vm.deal(eoa.addr, 10 ether);
    vm.deal(address(this), 10 ether);

    // EIP-7702: Set the BatchExecutor code to the EOA
    // This simulates the EIP-7702 delegation where an EOA can have contract code
    vm.signAndAttachDelegation(address(implementation), eoa.privateKey);
  }

  /**
   * @dev Tests that EIP-7702 delegation is properly set up
   * @notice Verifies that the EOA has the correct delegation bytecode format
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_Initialize() public view {
    // Verify that the EOA now has the BatchExecutor code
    bytes memory code = eoa.addr.code;
    bytes memory expected = abi.encodePacked(hex"ef0100", address(implementation));

    // Check that the EOA has non-empty code after delegation
    assertNotEq(code.length, 0, "EOA should have non-empty code after EIP-7702 delegation");

    // EIP-7702 uses ef0100 as the delegation designator prefix to indicate this bytecode is a delegation
    // The 20 bytes following ef0100 represent the address of the actual implementation contract
    assertEq(code, expected, "EOA code should match the expected EIP-7702 delegation format");
  }

  /**
   * @dev Tests execution of a single batch operation
   * @notice Verifies that the EOA can execute a single transfer operation through BatchExecutor
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_WhenOperation_ExecuteBatch() public {
    // Create a single batch operation
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](1);

    uint256 value = 1 ether;
    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: value, data: ""});

    // Record initial balances
    uint256 initialToBalance = to.balance;
    uint256 initialEoaBalance = eoa.addr.balance;

    // Call the BatchExecutor function through the EOA that has the code set
    vm.prank(eoa.addr);
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Verify that the transfer was successful
    assertEq(to.balance, initialToBalance + value);
    assertEq(eoa.addr.balance, initialEoaBalance - value);
  }

  /**
   * @dev Tests execution of multiple batch operations in a single transaction
   * @notice Verifies that the EOA can execute multiple transfer operations atomically
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST
   */
  function test_WhenMultipleOperation_ExecuteBatch() public {
    // Create multiple batch operations
    BatchExecutor.BatchTransferOperation[]
      memory operations = new BatchExecutor.BatchTransferOperation[](3);

    operations[0] = BatchExecutor.BatchTransferOperation({target: to, value: 1 ether, data: ""});
    operations[1] = BatchExecutor.BatchTransferOperation({target: to, value: 2 ether, data: ""});
    operations[2] = BatchExecutor.BatchTransferOperation({target: to, value: 0.5 ether, data: ""});

    // Record initial balances
    uint256 initialToBalance = to.balance;
    uint256 initialEoaBalance = eoa.addr.balance;

    // Execute batch through the EOA with BatchExecutor code
    vm.prank(eoa.addr);
    BatchExecutor(payable(eoa.addr)).executeBatch(operations);

    // Verify that all transfers were successful (total: 3.5 ether)
    assertEq(to.balance, initialToBalance + 3.5 ether);
    assertEq(eoa.addr.balance, initialEoaBalance - 3.5 ether);
  }

  /**
   * @dev Tests that the EOA with BatchExecutor code can receive ETH
   * @notice This test checks whether external accounts can send ETH to the delegated EOA
   * @notice Currently this will fail - Your task: modify the `BatchExecutor` contract so this test passes
   * @notice IMPORTANT: DO NOT MODIFY THIS TEST - Only modify the BatchExecutor contract
   */
  function test_ReceiveEther() public {
    // Record initial balance
    uint256 initialBalance = eoa.addr.balance;
    uint256 sendAmount = 2 ether;

    // Test that someone can send ether to the EOA with BatchExecutor code
    address sender = makeAddr("sender");
    vm.deal(sender, 5 ether);
    vm.prank(sender);
    (bool success, ) = eoa.addr.call{value: sendAmount}("");

    // Verify that the ETH transfer was successful
    assertTrue(success, "BatchExecutor should be able to receive ether");
    assertEq(
      eoa.addr.balance,
      initialBalance + sendAmount,
      "EOA with BatchExecutor code should receive the ether"
    );
  }
}
