// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./libraries/types/DataTypes.sol";
import "./libraries/helpers/Roles.sol";
import "./libraries/helpers/Events.sol";
import "./libraries/helpers/Errors.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Rewards is AccessControlUpgradeable {

    uint256 public latestRewards;
    uint256 public periodicity;

    mapping(uint256 => bytes32) public rootHashes;

    // tree root hash to user address to tree leaf hash to boolean
    mapping(bytes32 => mapping(address => mapping(bytes32 => bool))) public rewardState;

    function deployRewards(bytes32 rootHash) onlyRole(Roles.REWARDS_ADMIN_ROLE) external {
        
        if (block.timestamp < latestRewards + periodicity - 100) {
            revert Errors.REWARDS_TOO_FAST(latestRewards, periodicity, block.timestamp);
        }
        
        latestRewards = block.timestamp;
        rootHashes[latestRewards] = rootHash;

        emit Events.DeployRewards(latestRewards, rootHash);
    }

    function claimRewards(uint256 rootHashId, bytes32 rootHash, bytes32[] memory proof, address _token, uint _amount) external {

        if (rootHashes[rootHashId] != rootHash) {
            
            revert Errors.INVALID_ROOT_HASH();
        }

        bytes32 leaf = generateLeaf(msg.sender, _token, _amount);

        if (MerkleProof.verify(proof, rootHash, leaf) == false) {
            
            revert Errors.INVALID_PROOF();
        }
        
        if (rewardState[rootHash][msg.sender][leaf] == true) {
            
            revert Errors.ALREADY_CLAIMED();
        }

        rewardState[rootHash][msg.sender][leaf] = true;

        // transfer rewards

        if (_token == address(0)){
            // transfer ETH
            (bool success, ) = msg.sender.call{value: _amount}("");
            if (!success) {
                revert Errors.TRANSFER_FAILED();
            }
        } else{
            // transfer ERC20
            bool success = IERC20(_token).transfer(msg.sender, _amount);
            if (!success) {
                revert Errors.TRANSFER_FAILED();
            }
        }

        emit Events.ClaimRewards(msg.sender, rootHashId, rootHash, _token, _amount);
    }

    function changePeriodicity(uint _newPeriod) onlyRole(Roles.REWARDS_ADMIN_ROLE) external {
        periodicity = _newPeriod;

        emit Events.ChangeRewardsPeriodicity(_newPeriod);
    }

    function generateLeaf(address _user, address _token, uint _amount) private pure returns (bytes32) {
        
        return keccak256(bytes.concat(keccak256(abi.encode(_user, _token, _amount))));
    }
}
