# GamePayy Contracts

This readme file contains explanation in regards to Gamepayy contracts: how it works, how to use it, and how to test it.

## Summary
1. [Core Contract](#core-contract)
2. [Arbitrators Contract](#arbitrators-contract)
3. [Asset Manager](#asset-manager)
4. [Funds Manager](#funds-manager)
5. [Oracle Registry](#oracle-registry)
6. [Rewards](#rewards)

## Core Contract
This contract acts as Gamepayy main contract. It contains all the services contracts addresses and serves as a central pauser for all services.
It provides the following functionalities:
- Pausing and unpausing all services
- Role management
    - Adding and removing ARBITRATOR_ROLE
    - Adding and removing ASSET_MANAGER_ROLE
    - Adding and removing FUNDS_MANAGER_ROLE
    - Adding and removing ORACLE_ROLE
    - Adding and removing REWARDS_ROLE
- Addition of new services through upgradeability

## Arbitrators Contract
This contract is used to manage arbitrators. 
It provides the following functionalities:
- Adding and removing arbitrators
- Airdropping incentives to arbitrators

## Asset Manager
This contract is used to manage rewardable assets.
It provides the following functionalities:
- Adding and removing rewardable assets
- Adding and removing rewardable assets managers

## Funds Manager
This contract is used to manage funds.
It provides the following functionalities:
- Adding and removing funds to the contract
- Withdrawing funds for team payments

## Oracle Registry
This contract is used to manage oracles.
It provides the following functionalities:
- Adding and removing oracles
- Checking oracles health status
- Pausing and unpausing oracle-based services

## Rewards
This contract is used to distribute rewards.
It provides the following functionalities:
- Dropping rewards to users through periodical merkle root hashes
- Claiming rewards by users

## Testing
To test the contracts, run the following command:
```
yarn hardhat test
```

## Deploying
To deploy the contracts, run the following command:
```
yarn hardhat
```


## Verifying


## Upgrading


## License
[Blue Oak Model License 1.0.0](https://blueoakcouncil.org/license/1.0.0)

## Authors
- [GamePayy](https://gamepayy.com)
- [João Freire](https://www.linkedin.com/in/joaovwfreire/)
