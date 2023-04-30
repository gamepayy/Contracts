# GamePayy Contracts

This readme file contains explanation in regards to Gamepayy contracts: how it works, how to use it, and how to test it.

## Summary
1. [Core Contract](#core-contract)

    * [Pausing](#pausing)
    * [Unpausing](#unpausing)
    * [Role management](#role-management)
    * [Upgradeability](#upgradeability)

2. [Arbitrators Contract](#arbitrators-contract)

    * [Arbitrator management](#arbitrator-management)
    * [Arbitrator incentives](#arbitrator-incentives)

3. [Asset Manager](#asset-manager)

    * [Asset management](#asset-management)

4. [Funds Manager](#funds-manager)

    * [Funds management](#funds-management)
    * [Team payments](#team-payments)

5. [Oracle Registry](#oracle-registry)

    * [Oracle management](#oracle-management)
    * [Oracle health status](#oracle-health-status)
    * [Oracle pausing](#oracle-pausing)

6. [Rewards](#rewards)

## Core Contract
![Core Contract](https://bafybeiccmvhucq6l6wxkg4npppy2lsoihnt4xk5gvqv4ughievefaxs7nm.ipfs.w3s.link/)
This contract acts as Gamepayy main contract. It contains all the services contracts addresses and serves as a central pauser for all services.
It provides the following functionalities:
### Pausing
- Pauses all services
    ``` solidity
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    ```
### Unpausing
- Unpauses all services
    ``` solidity
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    ```
### Role management
- Role management
    ``` solidity	
    function grantRole(bytes32 role, address account) public virtual override onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }
    ```
    - Adds and removes DEFAULT_ADMIN_ROLE
    - Adds and removes ARBITRATOR_ROLE
    - Adds and removes ASSET_APPROVER_ROLE
    - Adds and removes FUNDS_MANAGER_ROLE
    - Adds and removes ORACLE_ADMIN_ROLE
    - Adds and removes PAUSER_ROLE
    - Adds and removes UPGRADER_ROLE

### Upgradeability
- Addition of new services through upgradeability
    ``` solidity
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
    ```

## Arbitrators Contract
This contract is used to manage arbitrators. 
It provides the following functionalities:

### Arbitrator management
- Adds arbitrators
    ``` solidity
    function addArbitrator(address arbitrator) external onlyRole(ARBITRATOR_ROLE) {
        arbitrators[arbitrator] = true;
    }
    ```
- Removes arbitrators
    ``` solidity
    function removeArbitrator(address arbitrator) external onlyRole(ARBITRATOR_ROLE) {
        arbitrators[arbitrator] = false;
    }
    ```

### Arbitrator incentives
- Airdropping incentives to arbitrators


## Asset Manager
This contract is used to manage rewardable assets.
It provides the following functionalities:

### Asset management
- Adds rewardable assets
    ``` solidity
    function approveAsset(address _asset) public onlyRole(Roles.ASSET_APPROVER_ROLE) {
        assets[assetCount] = _asset;
        isAssetApproved[_asset] = true;
        assetCount++;

        emit Events.AssetApproved(_asset, msg.sender);
    }
    ```
- Removes rewardable assets
    ``` solidity
    function disapproveAsset(address _asset) public onlyRole(Roles.ASSET_APPROVER_ROLE) {
        isAssetApproved[_asset] = false;

        emit Events.AssetDisapproved(_asset, msg.sender);
    }
    ```

## Funds Manager
This contract is used to manage funds.
It provides the following functionalities:
### Funds management
- Adds and removes funds to the contract

### Team payments
- Withdrawing funds for team payments
``` solidity	
function withdrawFunds(address payable _to, uint256 _amount) public onlyRole(Roles.FUNDS_MANAGER_ROLE) {
       (bool success, ) = _to.call{value: _amount}("");
       if (!success) {
           revert Errors.TRANSFER_FAILED();
       }

         emit Events.AdminWithdraw(_to, _amount);

    }
```

## Oracle Registry
This contract is used to manage oracles.
It provides the following functionalities:

### Oracle management
- Adds oracles
    ``` solidity
    function setPriceFeed(address _token, address _priceFeed) onlyRole(Roles.ORACLE_ADMIN_ROLE) external {
        tokenToPriceFeed[_token].priceFeed = _priceFeed;
        emit Events.PriceFeedSet(_token, _priceFeed);
    }
    ```
### Oracle health status
- Checking oracles health status
``` solidity
function tryPrice(address _token) public returns (uint256) {
        
        try this.getPrice(_token) returns (uint256 price) {

            return price;
        } catch (bytes memory errData) {

            if (errData.length == 0) revert(); // solhint-disable-line reason-string
            pauseFeed(_token);
        }
    }
```

### Oracle pausing

- Pauses oracle-based services
``` solidity	
function pauseFeed(address _token) private {

        tokenToPriceFeed[_token].paused = true;
        emit Events.PriceFeedPaused(_token, tokenToPriceFeed[_token].priceFeed);
    }
```

- Unpauses oracle-based services
``` solidity
function unpauseFeed(address _token) private {

        tokenToPriceFeed[_token].paused = false;
        emit Events.PriceFeedUnpaused(_token, tokenToPriceFeed[_token].priceFeed);
    }
```

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
