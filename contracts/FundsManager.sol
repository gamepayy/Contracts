// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";
import "./libraries/helpers/Errors.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract FundsManager is AccessControlUpgradeable, ReentrancyGuardUpgradeable {

    function withdrawFunds(address payable _to, uint256 _amount) public onlyRole(Roles.FUNDS_MANAGER_ROLE) {
       (bool success, ) = _to.call{value: _amount}("");
       if (!success) {
           revert Errors.TRANSFER_FAILED();
       }

         emit Events.AdminWithdraw(_to, _amount);

    }

    fallback () external payable nonReentrant {
        
    }
}