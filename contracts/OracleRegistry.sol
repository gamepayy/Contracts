// SPDX-License-Identifier: MIT

/*
This contract provides easy interfaces for setting and getting price feeds for tokens.
Through the usage of token address to data feed address mappings, 
it can directly query Chainlink data feeds and utilize the
AggregatorV3 interface to get the latest price of a token.
This contract also implements external price queries through the usage of try/catch blocks, meaning
failing or invalid price queries will not revert the transaction, but lock the contract and protect
user funds.
*/

pragma solidity 0.8.19;

import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";	
import "./libraries/types/DataTypes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OracleRegistry is AccessControlUpgradeable {
    // address(0x0) is native token to usd price feed
    // can i even pass address zero argument? DO NOT FORGET TO TEST THIS EDGE CASE
    mapping(address => DataTypes.TokenData) public tokenToPriceFeed;
    uint256 public constant nativeTokenDecimals = 18;

    function setPriceFeed(address _priceFeed) onlyRole(Roles.ORACLE_ADMIN_ROLE) external {
        tokenToPriceFeed[address(0)].priceFeed = _priceFeed;
        emit Events.PriceFeedSet(address(0), _priceFeed);
    }

    function setPriceFeed(address _token, address _priceFeed) onlyRole(Roles.ORACLE_ADMIN_ROLE) external {
        tokenToPriceFeed[_token].priceFeed = _priceFeed;
        emit Events.PriceFeedSet(_token, _priceFeed);
    }

    function getPrice() public view returns (uint256) {

        address priceFeed = tokenToPriceFeed[address(0)].priceFeed;
        
        (, int256 price, , , ) = AggregatorV3Interface(priceFeed).latestRoundData();

        // test cases with random decimals
        // does it work if the result is negative? DO NOT FORGET TO TEST THIS EDGE CASE
        return (uint256(price));
    }

    function getPrice(address _token) public view returns (uint256) {

        address priceFeed = tokenToPriceFeed[_token].priceFeed;
        
        (, int256 price, , , ) = AggregatorV3Interface(priceFeed).latestRoundData();

        uint256 tokenDecimals = IERC20Metadata(_token).decimals();

        // test cases with random decimals
        // does it work if the result is negative? DO NOT FORGET TO TEST THIS EDGE CASE
        return (uint256(price) * 10 ** (nativeTokenDecimals - tokenDecimals));
    }

    function unpauseFeed(address _token) public onlyRole(Roles.ORACLE_ADMIN_ROLE) {

        tokenToPriceFeed[_token].paused = false;
        emit Events.PriceFeedUnPaused(_token, tokenToPriceFeed[_token].priceFeed);
    }

    function unpauseFeed() public onlyRole(Roles.ORACLE_ADMIN_ROLE) {

        tokenToPriceFeed[address(0)].paused = false;
        emit Events.PriceFeedUnPaused(address(0), tokenToPriceFeed[address(0)].priceFeed);
    }


    function pauseFeed(address _token) public onlyRole(Roles.ORACLE_ADMIN_ROLE)  {

        tokenToPriceFeed[_token].paused = true;
        emit Events.PriceFeedPaused(_token, tokenToPriceFeed[_token].priceFeed);
    }

    function pauseFeed() public onlyRole(Roles.ORACLE_ADMIN_ROLE)  {

        tokenToPriceFeed[address(0)].paused = true;
        emit Events.PriceFeedPaused(address(0), tokenToPriceFeed[address(0)].priceFeed);
    }
}