// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/types/DataTypes.sol";
import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";
import "./libraries/helpers/Errors.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";


contract AssetManager is AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    mapping (address => mapping(address => uint)) public userBalances;
    mapping (address => DataTypes.UserAssetData) public userData;
    mapping (uint8 => address) public assets;
    mapping (address => bool) public isAssetApproved;

    uint8 public assetCount;

    function approveAsset(address _asset) public onlyRole(Roles.ASSET_MANAGER_ROLE) {
        assets[assetCount] = _asset;
        isAssetApproved[_asset] = true;
        assetCount++;

        emit Events.AssetApproved(_asset, msg.sender);
    }

    function removeAsset(address _asset) public onlyRole(Roles.ASSET_MANAGER_ROLE) {
        isAssetApproved[_asset] = false;

        emit Events.AssetRemoved(_asset, msg.sender);
    }

    function deposit(address _asset, uint _amount) public payable nonReentrant {
        
        if (isAssetApproved[_asset] == false) {
            
            revert Errors.ASSET_NOT_SUPPORTED();
        }

        if (_asset == address(0)) {

            userBalances[msg.sender][address(0)] += msg.value;

            
        } else {
            // requires that the user has approved the contract to spend the amount

            if (_amount == 0) {
                
                revert Errors.INVALID_AMOUNT();
            }

            IERC20Metadata(_asset).transferFrom(msg.sender, address(this), _amount);
            userBalances[msg.sender][_asset] += _amount;
        }

        emit Events.Deposit(msg.sender, _asset, _amount);
    }

    function userWithdraw(address _asset, uint _amount) public {
        
        if (isAssetApproved[_asset] == false) {
            
            revert Errors.ASSET_NOT_SUPPORTED();
        }

        if (_amount == 0) {
            
            revert Errors.INVALID_AMOUNT();
        }

        if(userBalances[msg.sender][_asset] < _amount) {
            
            revert Errors.INSUFFICIENT_BALANCE();
        }

        if (_asset == address(0)) {

            (bool success, ) = payable(msg.sender).call{value: _amount}("");
            if (!success) {

                revert Errors.TRANSFER_FAILED();
            }
        } else {

            IERC20Metadata(_asset).transfer(msg.sender, _amount);
        }
        userBalances[msg.sender][_asset] -= _amount;

        emit Events.Withdraw(msg.sender, _asset, _amount);
    }
}