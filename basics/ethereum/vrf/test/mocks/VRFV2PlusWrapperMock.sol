// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {VRFV2PlusWrapperConsumerBase} from "@chainlink/contracts/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol";
import {IVRFV2PlusWrapper} from "@chainlink/contracts/v0.8/vrf/dev/interfaces/IVRFV2PlusWrapper.sol";

/**
 * @title VRFV2PlusWrapperMock
 * @dev Mock implementation of Chainlink VRF V2 Plus Wrapper for testing purposes
 * This mock contract simulates the behavior of the real VRF wrapper contract:
 * 1. Accepts requests for random numbers
 * 2. Tracks request IDs and consumers
 * 3. Allows manual fulfillment of random number requests
 */
contract VRFV2PlusWrapperMock is IVRFV2PlusWrapper {
    // State variables
    uint256 private s_requestId;                    // Current request ID counter
    uint256 private constant PRICE = 0.1 ether;     // Fixed price for VRF requests
    address private immutable i_link;               // LINK token address (not used in tests)
    mapping(uint256 => address) private s_consumers; // Maps request IDs to consumer addresses

    // Errors
    error ConsumerNotFound();  // Thrown when request ID doesn't exist

    /**
     * @dev Constructor initializes the mock wrapper
     * Sets LINK token address to zero (not needed for testing)
     * Initializes request ID counter to 1
     */
    constructor() {
        i_link = address(0); // We don't need LINK token for testing
        s_requestId = 1; // Initialize with 1 to avoid 0 as default
    }

    /**
     * @dev Returns the LINK token address
     * @return address LINK token address (always zero in mock)
     */
    function link() external view returns (address) {
        return i_link;
    }

    /**
     * @dev Returns the LINK/Native price feed address
     * @return address Always returns zero address in mock
     */
    function linkNativeFeed() external view returns (address) {
        return address(0);
    }

    /**
     * @dev Sets the next request ID to be returned
     * @param requestId The request ID to set
     * @notice Used in tests to control request ID sequence
     */
    function setRequestId(uint256 requestId) external {
        s_requestId = requestId;
    }

    /**
     * @dev Calculates the price for a VRF request in LINK
     * @param _callbackGasLimit Gas limit for callback function
     * @param _numWords Number of random words requested
     * @return uint256 Fixed price of 0.1 ETH
     * @notice Returns a fixed price regardless of parameters
     */
    function calculateRequestPrice(uint32 _callbackGasLimit, uint32 _numWords) external pure returns (uint256) {
        _callbackGasLimit; // silence unused variable warning
        _numWords; // silence unused variable warning
        return PRICE;
    }

    /**
     * @dev Calculates the price for a VRF request in Native token
     * @param _callbackGasLimit Gas limit for callback function
     * @param _numWords Number of random words requested
     * @return uint256 Fixed price of 0.1 ETH
     * @notice Returns a fixed price regardless of parameters
     */
    function calculateRequestPriceNative(uint32 _callbackGasLimit, uint32 _numWords) external pure returns (uint256) {
        _callbackGasLimit; // silence unused variable warning
        _numWords; // silence unused variable warning
        return PRICE;
    }

    /**
     * @dev Estimates the price of a VRF request with specific gas price
     * @param _callbackGasLimit Gas limit for callback function
     * @param _numWords Number of random words requested
     * @param _requestGasPriceWei Gas price in wei
     * @return uint256 Fixed price of 0.1 ETH
     */
    function estimateRequestPrice(
        uint32 _callbackGasLimit,
        uint32 _numWords,
        uint256 _requestGasPriceWei
    ) external pure returns (uint256) {
        _callbackGasLimit;      // silence unused variable warning
        _numWords;             // silence unused variable warning
        _requestGasPriceWei;   // silence unused variable warning
        return PRICE;
    }

    /**
     * @dev Estimates the price of a VRF request in Native token with specific gas price
     * @param _callbackGasLimit Gas limit for callback function
     * @param _numWords Number of random words requested
     * @param _requestGasPriceWei Gas price in wei
     * @return uint256 Fixed price of 0.1 ETH
     */
    function estimateRequestPriceNative(
        uint32 _callbackGasLimit,
        uint32 _numWords,
        uint256 _requestGasPriceWei
    ) external pure returns (uint256) {
        _callbackGasLimit;      // silence unused variable warning
        _numWords;             // silence unused variable warning
        _requestGasPriceWei;   // silence unused variable warning
        return PRICE;
    }

    /**
     * @dev Simulates requesting random words from VRF using Native token
     * @param _callbackGasLimit Gas limit for callback function
     * @param _requestConfirmations Number of block confirmations required
     * @param _numWords Number of random words requested
     * @param extraArgs Additional arguments (not used in mock)
     * @return uint256 The request ID
     * @notice Requires payment of PRICE in ETH
     */
    function requestRandomWordsInNative(
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        uint32 _numWords,
        bytes calldata extraArgs
    ) external payable returns (uint256) {
        require(msg.value >= PRICE, "Insufficient payment");
        _callbackGasLimit;      // silence unused variable warning
        _requestConfirmations;  // silence unused variable warning
        _numWords;             // silence unused variable warning
        extraArgs;             // silence unused variable warning

        uint256 requestId = s_requestId;
        s_requestId += 1;
        s_consumers[requestId] = msg.sender;
        return requestId;
    }

    /**
     * @dev Fulfills a random number request
     * @param _requestId The ID of the request to fulfill
     * @param _randomWords Array of random numbers to return
     * @notice Only the original consumer can fulfill the request
     * @notice Calls the consumer's rawFulfillRandomWords function
     */
    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) external {
        address consumer = s_consumers[_requestId];
        if (consumer == address(0)) revert ConsumerNotFound();
        // Call the consumer's rawFulfillRandomWords function
        try VRFV2PlusWrapperConsumerBase(consumer).rawFulfillRandomWords(_requestId, _randomWords) {
            // Success
            delete s_consumers[_requestId];
        } catch Error(string memory reason) {
            revert(reason);
        } catch {
            revert("Callback failed");
        }
    }

    /**
     * @dev Returns the last request ID
     * @return uint256 The last request ID
     */
    function lastRequestId() external view returns (uint256) {
        return s_requestId;
    }

    /**
     * @dev Returns the consumer address for a given request ID
     * @param _requestId The request ID to look up
     * @return address The consumer address
     */
    function getConsumer(uint256 _requestId) external view returns (address) {
        return s_consumers[_requestId];
    }
} 