// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {console} from "forge-std/console.sol";

/**
 * @title Lottery
 * @dev A simple lottery contract using Chainlink VRF for random number generation.
 * This contract implements a provably fair lottery system where:
 * 1. Players can join by paying the VRF request fee
 * 2. Chainlink VRF generates a random number
 * 3. The random number determines if the player wins based on a configurable winning rate
 * 4. Winners receive the accumulated prize pool
 * 
 * The contract uses Chainlink VRF's direct funding method, where each request is paid for directly.
 * The winning rate is configurable from 0-10000 (representing 0-100% with 2 decimal precision).
 */
contract Lottery is VRFV2PlusWrapperConsumerBase, Ownable {
    // Errors
    error InvalidWinningRate(); // Thrown when winning rate exceeds 10000
    error AlreadyHasRequest();  // Thrown when player already has a pending request
    error InsufficientPayment(); // Thrown when payment is less than required

    // Events
    event LotteryJoined(address indexed player, uint256 requestId); // Emitted when a player joins the lottery
    event LotteryWon(address indexed player, uint256 amount);      // Emitted when a player wins
    event LotteryLost(address indexed player);                     // Emitted when a player loses
    event WinningRateUpdated(uint256 oldRate, uint256 newRate);   // Emitted when winning rate is updated

    // Constants for VRF
    uint32 private constant CALLBACK_GAS_LIMIT = 300000;  // Gas limit for VRF callback
    uint16 private constant REQUEST_CONFIRMATIONS = 3;    // Number of block confirmations required
    uint32 private constant NUM_WORDS = 1;               // Number of random words to request

    // State variables
    uint256 public winningRate;                       // Winning rate (0-10000, where 10000 = 100%)
    mapping(address => bool) private hasPendingRequest; // Tracks if a player has a pending request
    mapping(uint256 => address) private requestToPlayer; // Maps request ID to player address

    /**
     * @dev Constructor initializes the lottery contract
     * @param _vrfWrapper Address of the VRF wrapper contract
     * @param _initialOwner Address that will be set as the owner
     * @param _winningRate Initial winning rate (0-10000, where 10000 = 100%)
     */
    constructor(
        address _vrfWrapper,
        address _initialOwner,
        uint256 _winningRate
    ) VRFV2PlusWrapperConsumerBase(_vrfWrapper) Ownable(_initialOwner) {
        if (_winningRate > 10000) revert InvalidWinningRate();
        winningRate = _winningRate;
    }

    /**
     * @dev Updates the winning rate
     * @param _winningRate New winning rate (0-10000, where 10000 = 100%)
     * @notice Only callable by the owner
     */
    function setWinningRate(uint256 _winningRate) external onlyOwner {
        if (_winningRate > 10000) revert InvalidWinningRate();
        uint256 oldRate = winningRate;
        winningRate = _winningRate;
        emit WinningRateUpdated(oldRate, _winningRate);
    }

    /**
     * @dev Allows a player to join the lottery
     * @notice Requires payment of the VRF request price
     * @notice Player cannot have a pending request
     */
    function join() external payable {
        if (hasPendingRequest[msg.sender]) revert AlreadyHasRequest();

        // Calculate the price for the VRF request
        uint256 price = estimateVrfFee();
        if (msg.value < price) revert InsufficientPayment();

        // Request random words from VRF
        uint256 requestId = _requestRandomWords();

        hasPendingRequest[msg.sender] = true;
        requestToPlayer[requestId] = msg.sender;
        emit LotteryJoined(msg.sender, requestId);
    }

    /**
     * @dev Callback function called by VRF when random words are generated
     * @param _requestId The ID of the request
     * @param _randomWords Array of random numbers
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        address player = requestToPlayer[_requestId];
        require(player != address(0), "Invalid request ID");
        
        hasPendingRequest[player] = false;

        // Determine if player wins based on random number
        bool isWinner = _randomWords[0] % 10000 < winningRate;

        if (isWinner) {
            uint256 prize = address(this).balance;
            (bool success,) = player.call{value: prize}("");
            require(success, "Transfer failed");
            emit LotteryWon(player, prize);
        } else {
            emit LotteryLost(player);
        }
    }

    /**
     * @dev Checks if a player has a pending request
     * @param player Address of the player to check
     * @return bool True if player has a pending request
     */
    function checkPendingRequest(address player) external view returns (bool) {
        return hasPendingRequest[player];
    }

    function estimateVrfFee() public view returns (uint256) {
        return i_vrfV2PlusWrapper.calculateRequestPriceNative(
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
        );
    }

    function _requestRandomWords() internal returns (uint256) {
          bytes memory extraArgs = VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment : true}));

        // Request random words from VRF
        (uint256 requestId,) = requestRandomnessPayInNative(
            CALLBACK_GAS_LIMIT,
            REQUEST_CONFIRMATIONS,
            NUM_WORDS,
            extraArgs
        );

        return requestId;
    }
}