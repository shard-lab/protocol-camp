// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Script} from "forge-std/Script.sol";
import {Lottery} from "../src/Lottery.sol";

contract JoinLottery is Script {
    function run() external {
        // Get deployment parameters from environment variables
        uint256 playerPrivateKey = vm.envUint("PRIVATE_KEY");
        address lotteryAddress = vm.envAddress("LOTTERY_ADDRESS");
        uint256 value = vm.envUint("VALUE");

        // Get the lottery contract instance
        Lottery lottery = Lottery(lotteryAddress);

        // Start broadcasting
        vm.startBroadcast(playerPrivateKey);

        // Join the lottery
        lottery.join{value: value}();

        vm.stopBroadcast();
    }
} 