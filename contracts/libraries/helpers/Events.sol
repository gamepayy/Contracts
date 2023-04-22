// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

library Events {
    event PriceFeedSet(address indexed token, address indexed priceFeed);

    event AssetApproved(address indexed asset, address indexed approver);
    event AssetDisapproved(address indexed asset, address indexed disapprover);

}