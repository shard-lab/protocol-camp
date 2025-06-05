# Chainlink VRF Lottery

This learning module is designed to help understand how random numbers (VRF) are used in applications through Chainlink VRF integration, rather than focusing on implementation details. The project demonstrates how to integrate Chainlink VRF (Verifiable Random Function) into a smart contract for generating provably fair random numbers.

## 1. Overview

Chainlink VRF is a provably fair and verifiable random number generator (RNG) that enables smart contracts to access random values without compromising security. This project implements a simple lottery system where:

1. Players can join the lottery by paying a fee
2. Chainlink VRF generates a random number
3. The random number determines if the player wins based on a configurable winning rate
4. Winners receive the accumulated prize pool

The lottery uses Chainlink VRF V2.5's direct funding method for simplicity, where each request is paid for directly by the contract. For more details about VRF V2.5, refer to the [official documentation](https://docs.chain.link/vrf).

## 2. Learning Objectives

**Chainlink VRF Integration**
- Learn how to integrate Chainlink VRF into smart contracts
- Understand the request-response pattern of VRF
- Implement callback handling for random number generation

## 3. Core Concepts

### 3.1 Chainlink VRF

Chainlink VRF works through a request-response pattern:

1. **Request Phase**
   - Contract sends a request for randomness to Chainlink VRF
   - Request includes callback gas limit and number of random words needed
   - Contract pays for the request using native token
   - Fee calculation is based on:
     - Current gas price
     - Callback gas limit
     - Number of random words requested
   - For detailed fee calculation, refer to the [billing documentation](https://docs.chain.link/vrf/v2-5/billing)

2. **Response Phase**
   - Chainlink VRF generates random number and cryptographic proof
   - VRF Coordinator calls back the contract with the random number
   - Contract processes the random number in the callback function

### 3.2 Lottery Contract Mechanics

The lottery operates under the following rules:

1. **Game Setup**
   - Contract owner sets the winning rate (0-10000, representing 0-100% with 2 decimal precision)
   - Players can join by paying the VRF request fee
   - Only one active request per player is allowed

2. **Winning Determination**
   - Random number from VRF is used to determine if player wins
   - Winning rate is configurable (e.g., 5000 = 50.00%)
   - If player wins, they receive the entire prize pool

3. **Prize Distribution**
   - Winners receive the entire accumulated prize pool
   - Prize pool consists of excess ETH from VRF requests
   - Contract automatically transfers prize to winner

## 4. Implementation Details

### 4.1 Contract Structure

```
.
├── src/
│   └── Lottery.sol    # Main lottery contract with VRF integration
├── test/
│   ├── Lottery.t.sol  # Foundry tests for the lottery contract
│   └── mocks/         # Mock contracts for testing
└── foundry.toml       # Foundry configuration
```

### 4.2 Core Components

1. **VRFV2PlusWrapperConsumerBase**
   - Base contract that simplifies Chainlink VRF V2.5 integration
   - Key Features:
     - Native token payment support (ETH instead of LINK)
     - Request lifecycle management
     - Callback handling and validation

2. **Lottery Contract (`src/Lottery.sol`)**
   - Inherits from `VRFV2PlusWrapperConsumerBase` for VRF integration
   - Key VRF Implementation Details:

     a. **Contract Inheritance and Initialization**
     ```solidity
     contract Lottery is VRFV2PlusWrapperConsumerBase, Ownable {
         constructor(
             address _vrfWrapper,
             address _initialOwner,
             uint256 _winningRate
         ) VRFV2PlusWrapperConsumerBase(_vrfWrapper) Ownable(_initialOwner) {
             // ... initialization code ...
         }
     }
     ```
     - Inherits from `VRFV2PlusWrapperConsumerBase` to get VRF functionality
     - `_vrfWrapper` is the address of the VRF Wrapper contract deployed on the network
       - Each network (Ethereum, BSC, etc.) has its own VRF Wrapper contract
       - Wrapper contract handles the interaction between your contract and Chainlink's VRF service
       - Provides network-specific configurations and fee calculations

     b. **VRF Request Price Calculation**
     ```solidity
     function estimateVrfFee() public view returns (uint256) {
         return i_vrfV2PlusWrapper.calculateRequestPriceNative(
             CALLBACK_GAS_LIMIT,
             NUM_WORDS
         );
     }
     ```
     - Uses `calculateRequestPriceNative` to estimate VRF request cost
     - Considers callback gas limit and number of random words needed
     - Returns the required payment amount in native token

     c. **Random Number Request**
     ```solidity
     function _requestRandomWords() internal returns (uint256) {
         bytes memory extraArgs = VRFV2PlusClient._argsToBytes(
             VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
         );

         (uint256 requestId,) = requestRandomnessPayInNative(
             CALLBACK_GAS_LIMIT,
             REQUEST_CONFIRMATIONS,
             NUM_WORDS,
             extraArgs
         );

         return requestId;
     }
     ```
     - `extraArgs` is used to configure additional parameters for the VRF request
       - In this case, it specifies that the payment will be made in native token 
       - Required for VRF V2.5 to handle native token payments
       - Can include other configurations like subscription ID if using subscription method
     - Sets callback gas limit, confirmations, and number of words
     - Returns request ID for tracking

     d. **Random Number Processing**
     ```solidity
     function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) 
         internal override 
     {
         address player = requestToPlayer[_requestId];
         // ... process random number and determine winner ...
     }
     ```
     - This is the callback function that Chainlink's VRF service calls
     - Automatically triggered when the random number is generated
     - Receives the request ID and array of random numbers
     - Must be implemented to handle the received random numbers

   - Additional Features:
     - Manages player requests and winning rate
     - Handles prize distribution
     - Tracks request status and player information

3. **Test Suite (`test/Lottery.t.sol`)**
   - Tests contract initialization and configuration
   - Verifies VRF request and callback flow
   - Tests winning probability and prize distribution
   - Tests error conditions and edge cases

### 4.3 Key Functions

1. **join()**
   - Players call this function to participate
   - Calculates VRF request price using `calculateRequestPriceNative`
   - Sends request to Chainlink VRF using `requestRandomWordsInNative`
   - Tracks player's active request

2. **fulfillRandomWords()**
   - Callback function from Chainlink VRF
   - Processes random number
   - Determines if player wins
   - Distributes prize if player wins

3. **setWinningRate()**
   - Owner-only function to configure winning probability
   - Validates new rate is within valid range (0-10000)

## 5. Running Tests

```bash
# Install dependencies
forge install

# Run tests
forge test
```

## 6. Hands-on Practice

The Lottery contract is deployed and verified on BSC Testnet at [0x27e5De33cB6d31894a875891D3D86aA5F5b8aB2a](https://testnet.bscscan.com/address/0x27e5De33cB6d31894a875891D3D86aA5F5b8aB2a#readContract).

### 6.1 Interacting with the Contract

There are two ways to interact with the deployed contract:

1. **Using Script**
   - Use the provided `JoinLottery.s.sol` script
   - Set required environment variables (refer to `.env.example`):
     ```bash
     export PRIVATE_KEY="your_private_key"
     export BSC_TESTNET_RPC_URL="https://bsc-testnet-rpc.publicnode.com"
     export VRF_WRAPPER="0x471506e6ADED0b9811D05B8cAc8Db25eE839Ac94"
     export LOTTERY_ADDRESS="0x27e5De33cB6d31894a875891D3D86aA5F5b8aB2a"
     export VALUE="8000000000000000"  # 0.008 BNB for VRF fee
     ```
   - Run the script:
     ```bash
     forge script script/JoinLottery.s.sol:JoinLottery --rpc-url $BSC_TESTNET_RPC_URL --broadcast -vvvv
     ```

2. **Using BSCScan**
   - Connect your wallet (e.g., MetaMask) to BSC Testnet
   - Visit the contract page on BSCScan
   - Use the "Write Contract" section to interact with the contract
   - Make sure your wallet has enough BNB for gas fees (at least 0.008 BNB for VRF fee)

### 6.2 Getting Test BNB

To get test BNB for the BSC Testnet:
1. Join the [BSC Discord](https://discord.com/invite/bnbchain)
2. Follow the guide in the #faucet-guide channel
3. Request test BNB from the faucet

### 6.3 Transaction Flow

When you interact with the contract, you can observe the following transaction flow:

1. **Join Transaction**
   - When you call the `join` function, a transaction is sent to the BSC Testnet
   - This transaction includes the VRF request fee and initiates the random number generation process
   - Example transaction: [0x94a9e62a5a35af01a671b14a3bb9092d97abaa22494989dbc2c4faa27a3ec5ad](https://testnet.bscscan.com/tx/0x94a9e62a5a35af01a671b14a3bb9092d97abaa22494989dbc2c4faa27a3ec5ad)
   

2. **VRF Callback Transaction**
   - After approximately 3 blocks, Chainlink VRF generates the random number
   - The `fulfillRandomWords` function is automatically called with the random number
   - This determines if you win and handles prize distribution
   - Example transaction: [0xba1612cc888d270ab380cc2776e5a4156e26fa7c371872f2a3d288d001800d90](https://testnet.bscscan.com/tx/0xba1612cc888d270ab380cc2776e5a4156e26fa7c371872f2a3d288d001800d90)

The entire process demonstrates how Chainlink VRF provides provably fair random numbers in a decentralized manner, with each step verifiable on the blockchain.
