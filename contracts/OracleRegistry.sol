// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";	
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract OracleRegistry is AccessControlUpgradeable {
    // address(0x0) is native token to usd price feed
    mapping(address => address) public tokenToPriceFeed;

    function setPriceFeed(address _token, address _priceFeed) onlyRole(Roles.ORACLE_ADMIN_ROLE) external {
        tokenToPriceFeed[_token] = _priceFeed;
        emit Events.PriceFeedSet(_token, _priceFeed);
    }

    function getPrice(address _token) public view returns (uint256) {
        // TODO: get price from AggregatorV3Interface
        // convert to 18 decimals for consistency
    }

}