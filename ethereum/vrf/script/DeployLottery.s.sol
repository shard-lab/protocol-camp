// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Script} from "forge-std/Script.sol";
import {Lottery} from "../src/Lottery.sol";

contract DeployLottery is Script {
    // Default winning rate (50%)
    uint256 constant DEFAULT_WINNING_RATE = 5000;

    function run() external returns (Lottery) {
        // Get deployment parameters from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        uint256 winningRate = vm.envOr("WINNING_RATE", DEFAULT_WINNING_RATE);
        address vrfWrapper = vm.envAddress("VRF_WRAPPER");

        // Start broadcasting
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Lottery contract
        Lottery lottery = new Lottery(
            vrfWrapper,
            deployer,
            winningRate
        );

        vm.stopBroadcast();

        return lottery;
    }
} 