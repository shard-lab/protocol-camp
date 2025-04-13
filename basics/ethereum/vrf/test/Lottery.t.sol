// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Test} from "forge-std/Test.sol";
import {VmSafe} from "forge-std/Vm.sol";
import {Lottery} from "../src/Lottery.sol";
import {VRFV2PlusWrapperMock} from "./mocks/VRFV2PlusWrapperMock.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LotteryTest
 * @dev Test contract for the Lottery implementation
 * 
 * Foundry Testing Basics:
 * - vm.prank(address): Sets msg.sender for the next call
 * - vm.recordLogs(): Records events emitted in the next call
 * - vm.deal(address, uint256): Sets ETH balance of an address
 * - vm.expectRevert(bytes): Expects the next call to revert
 * 
 * For detailed Foundry testing documentation, see:
 * https://book.getfoundry.sh/forge/forge-std
 * 
 * This test suite covers:
 * 1. Contract initialization and configuration
 * 2. VRF request and callback flow
 * 3. Winning probability calculations
 * 4. Prize distribution
 * 5. Error conditions and edge cases
 */
contract LotteryTest is Test {
    Lottery public lottery;
    VRFV2PlusWrapperMock public vrfWrapper;

    // Test constants
    address public constant PLAYER = address(1);
    address public constant CHAINLINK = address(2);
    uint256 public constant INITIAL_BALANCE = 10 ether;
    uint256 public constant REQUEST_PRICE = 0.1 ether;
    uint256 public constant INITIAL_WINNING_RATE = 5000; // 50%

    // Events to test
    event LotteryJoined(address indexed player, uint256 requestId);
    event LotteryWon(address indexed player, uint256 amount);
    event LotteryLost(address indexed player);
    event WinningRateUpdated(uint256 oldRate, uint256 newRate);

    /**
     * @dev Setup function that runs before each test
     * Deploys mock VRF wrapper and Lottery contract
     * Sets up test player with initial balance
     */
    function setUp() public {
        // Deploy VRF wrapper mock
        vrfWrapper = new VRFV2PlusWrapperMock();
        
        // Deploy Lottery with mock VRF wrapper
        lottery = new Lottery(
            address(vrfWrapper),
            address(this), // Test contract is the owner
            INITIAL_WINNING_RATE
        );

        // Setup player account with initial balance
        vm.deal(PLAYER, INITIAL_BALANCE);
        vm.deal(CHAINLINK, INITIAL_BALANCE);
    }

    /**
     * @dev Test winning rate update functionality
     * Verifies rate update, event emission, and access control
     */
    function test_SetWinningRate() public {
        uint256 newRate = 7000;
        
        vm.recordLogs();
        lottery.setWinningRate(newRate);
        
        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1, "Should emit one event");
        assertEq(entries[0].topics[0], keccak256("WinningRateUpdated(uint256,uint256)"), "Wrong event signature");
        (uint256 oldRate, uint256 updatedRate) = abi.decode(entries[0].data, (uint256, uint256));
        assertEq(oldRate, INITIAL_WINNING_RATE, "Wrong old rate in event");
        assertEq(updatedRate, newRate, "Wrong new rate in event");
        
        assertEq(lottery.winningRate(), newRate, "Winning rate not updated");
    }

    /**
     * @dev Test winning rate update access control
     * Verifies that only owner can update winning rate
     */
    function test_SetWinningRate_RevertIfNotOwner() public {
        vm.prank(PLAYER);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, PLAYER));
        lottery.setWinningRate(7000);
    }

    /**
     * @dev Test winning rate validation
     * Verifies that rate cannot exceed 10000 (100%)
     */
    function test_SetWinningRate_RevertIfInvalidRate() public {
        vm.expectRevert(Lottery.InvalidWinningRate.selector);
        lottery.setWinningRate(10001);
    }

    /**
     * @dev Test lottery participation
     * Verifies request creation, event emission, and state updates
     */
    function test_Join() public {
        uint256 requestId = 1;
        vrfWrapper.setRequestId(requestId);

        vm.prank(PLAYER);
        vm.recordLogs();
        lottery.join{value: REQUEST_PRICE}();

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1, "Should emit one event");
        assertEq(entries[0].topics[0], keccak256("LotteryJoined(address,uint256)"), "Wrong event signature");
        // The player address is in topics[1] because it's indexed
        assertEq(address(uint160(uint256(entries[0].topics[1]))), PLAYER, "Wrong player address in event");
        // The requestId is in data because it's not indexed
        assertEq(abi.decode(entries[0].data, (uint256)), requestId, "Wrong request ID in event");

        assertTrue(lottery.checkPendingRequest(PLAYER), "Player should have pending request");
    }

    /**
     * @dev Test insufficient funds handling
     * Verifies that join fails if insufficient ETH is sent
     */
    function test_Join_RevertIfInsufficientFunds() public {
        vm.prank(PLAYER);
        vm.expectRevert(Lottery.InsufficientPayment.selector);
        lottery.join{value: REQUEST_PRICE - 0.01 ether}();
    }

    /**
     * @dev Test multiple request prevention
     * Verifies that player cannot have multiple active requests
     */
    function test_Join_RevertIfPendingRequest() public {
        uint256 requestId = 1;
        vrfWrapper.setRequestId(requestId);

        // First join
        vm.prank(PLAYER);
        lottery.join{value: REQUEST_PRICE}();

        // Try to join again
        vm.prank(PLAYER);
        vm.expectRevert(Lottery.AlreadyHasRequest.selector);
        lottery.join{value: REQUEST_PRICE}();
    }

    /**
     * @dev Test winning scenario
     * Verifies prize distribution and state updates when player wins
     */
    function test_FulfillRandomWords_Winner() public {
        // Setup
        uint256 requestId = 1;
        vrfWrapper.setRequestId(requestId);
        vm.deal(address(lottery), 1 ether); // Add prize pool

        // Join lottery
        vm.prank(PLAYER);
        lottery.join{value: REQUEST_PRICE}();

        // Prepare random number that will result in a win
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 4999; // Will result in win with 50% winning rate

        // Fulfill request
        uint256 playerBalanceBefore = PLAYER.balance;
        
        vm.recordLogs();
        vm.prank(CHAINLINK);
        vrfWrapper.fulfillRandomWords(requestId, randomWords);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1, "Should emit one event");
        assertEq(entries[0].topics[0], keccak256("LotteryWon(address,uint256)"), "Wrong event signature");
        // The winner address is in topics[1] because it's indexed
        assertEq(address(uint160(uint256(entries[0].topics[1]))), PLAYER, "Wrong winner address in event");
        // The prize amount is in data because it's not indexed
        assertEq(abi.decode(entries[0].data, (uint256)), 1 ether, "Wrong prize amount in event");
        
        // Verify
        assertFalse(lottery.checkPendingRequest(PLAYER), "Request should be cleared");
        assertEq(PLAYER.balance, playerBalanceBefore + 1 ether, "Winner should receive prize");
    }

    /**
     * @dev Test losing scenario
     * Verifies state updates when player loses
     */
    function test_FulfillRandomWords_Loser() public {
        // Setup
        uint256 requestId = 1;
        vrfWrapper.setRequestId(requestId);
        vm.deal(address(lottery), 1 ether); // Add prize pool

        // Join lottery
        vm.prank(PLAYER);
        lottery.join{value: REQUEST_PRICE}();

        // Prepare random number that will result in a loss
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 5000; // Will result in loss with 50% winning rate

        // Fulfill request
        vm.recordLogs();
        vm.prank(CHAINLINK);
        vrfWrapper.fulfillRandomWords(requestId, randomWords);

        VmSafe.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1, "Should emit one event");
        assertEq(entries[0].topics[0], keccak256("LotteryLost(address)"), "Wrong event signature");
        // The player address is in topics[1] because it's indexed
        assertEq(address(uint160(uint256(entries[0].topics[1]))), PLAYER, "Wrong player address in event");
        
        // Verify
        assertFalse(lottery.checkPendingRequest(PLAYER), "Request should be cleared");
        assertEq(address(lottery).balance, 1 ether, "Prize pool should remain unchanged");
    }
} 