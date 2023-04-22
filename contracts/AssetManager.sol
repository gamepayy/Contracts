// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/types/DataTypes.sol";
import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";


contract AssetManager is AccessControlUpgradeable {
    mapping (address => mapping(address => uint)) public userBalances;
    mapping (address => DataTypes.UserAssetData) public userData;
    mapping (uint8 => address) public assets;
    mapping (address => bool) public isAssetApproved;

    uint8 public assetCount;

    function approveAsset(address _asset) public onlyRole(Roles.ASSET_APPROVER_ROLE) {
        assets[assetCount] = _asset;
        isAssetApproved[_asset] = true;
        assetCount++;

        emit Events.AssetApproved(_asset, msg.sender);
    }

    function disapproveAsset(address _asset) public onlyRole(Roles.ASSET_APPROVER_ROLE) {
        isAssetApproved[_asset] = false;

        emit Events.AssetDisapproved(_asset, msg.sender);
    }
}