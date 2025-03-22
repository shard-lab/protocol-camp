// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Mev.sol";

contract DeployMev is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_DEPLOYER");

    vm.startBroadcast(deployerPrivateKey);
    Mev mev = new Mev();
    vm.stopBroadcast();

    string memory addressesJson = string(
      abi.encodePacked('{"mev":"', vm.toString(address(mev)), '"}')
    );
    vm.writeFile("addresses.json", addressesJson);
  }
}
