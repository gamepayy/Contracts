// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

library Events {

    // Funds Manager
    event AssetApproved(address indexed asset, address indexed approver);
    event AssetDisapproved(address indexed asset, address indexed disapprover);

    // Oracle Registry
    event PriceFeedPaused(address indexed token, address indexed priceFeed);
    event PriceFeedUnPaused(address indexed token, address indexed priceFeed);
    event PriceFeedSet(address indexed token, address indexed priceFeed);

}