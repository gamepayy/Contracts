// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

library Events {

    // Funds Manager
    event AdminWithdraw(address indexed to, uint amount);

    // Oracle Registry
    event PriceFeedPaused(address indexed token, address indexed priceFeed);
    event PriceFeedUnPaused(address indexed token, address indexed priceFeed);
    event PriceFeedSet(address indexed token, address indexed priceFeed);

    // Asset Manager
    event AssetApproved(address indexed asset, address indexed approver);
    event AssetRemoved(address indexed asset, address indexed remover);
    event Deposit(address indexed user, address indexed asset, uint amount);
    event Withdraw(address indexed user, address indexed asset, uint amount);

    // Rewards
    event DeployRewards(uint256 indexed rootHashId, bytes32 indexed rootHash);
    event ClaimRewards(address indexed user, uint256 indexed rootHashId, bytes32 indexed rootHash, address token, uint256 amount);
    event ChangeRewardsPeriodicity(uint256 indexed periodicity);
}