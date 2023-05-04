// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Errors.sol";
import "./libraries/helpers/Events.sol";
import "./OracleRegistry.sol";
import "./AssetManager.sol";
import "./FundsManager.sol";
import "./Arbitrators.sol";


/// @custom:security-contact jovi@gamepayy.com
contract GPCore is Initializable, PausableUpgradeable, AccessControlUpgradeable, UUPSUpgradeable, OracleRegistry, AssetManager, FundsManager, Arbitrators {
   

    mapping(address => uint256) public balances;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Roles.PAUSER_ROLE, msg.sender);
        _grantRole(Roles.UPGRADER_ROLE, msg.sender);
        _grantRole(Roles.FUNDS_MANAGER_ROLE, msg.sender);
        _grantRole(Roles.ASSET_MANAGER_ROLE, msg.sender);
        _grantRole(Roles.ARBITRATOR_ROLE, msg.sender);
        _grantRole(Roles.ORACLE_ADMIN_ROLE, msg.sender);
        _grantRole(Roles.REWARDS_ADMIN_ROLE, msg.sender);
    }

    function pause() public onlyRole(Roles.PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(Roles.PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(Roles.UPGRADER_ROLE)
        override
    {}

}