// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/helpers/Roles.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract Arbitrators is AccessControlUpgradeable {
    mapping (address => bool) public arbitrators;

    function addArbitrator(address _arbitrator) public onlyRole(Roles.ARBITRATOR_ROLE) {
        arbitrators[_arbitrator] = true;
    }

    function removeArbitrator(address _arbitrator) public onlyRole(Roles.ARBITRATOR_ROLE) {
        arbitrators[_arbitrator] = false;
    }

}