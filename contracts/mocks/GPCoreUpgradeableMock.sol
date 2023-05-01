// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "../GPCore.sol";

contract GPCoreUpgradeableMock is GPCore {

    function newFunction() public pure returns (uint256) {
        return 1;
    }
}