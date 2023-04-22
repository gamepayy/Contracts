// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/helpers/Roles.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract FundsManager is AccessControlUpgradeable {

    function withdraw(address payable _to, uint256 _amount) public onlyRole(Roles.FUNDS_MANAGER_ROLE) {
        _to.transfer(_amount);
    }
}