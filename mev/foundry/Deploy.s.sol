// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NthCallerGame.sol";

contract Deploy is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_DEPLOYER");

    vm.startBroadcast(deployerPrivateKey);
    NthCallerGame nthCallerGame = new NthCallerGame();
    vm.stopBroadcast();

    string memory addressesJson = string(
      abi.encodePacked('{"nthCallerGame":"', vm.toString(address(nthCallerGame)), '"}')
    );
    vm.writeFile("addresses.json", addressesJson);
  }
}
