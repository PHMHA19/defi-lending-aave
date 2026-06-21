// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {IBaseVotingStrategy} from '../interfaces/IBaseVotingStrategy.sol';
import {Errors} from './libraries/Errors.sol';

/**
 * @title BaseVotingStrategy
 * @author BGD Labs
 * @notice This contract contains the base logic of a voting strategy, being on governance chain or voting machine chain.
 */
abstract contract BaseVotingStrategy is IBaseVotingStrategy {
  address internal immutable GOVERNANCE_TOKEN;

  uint128 public constant BASE_BALANCE_SLOT = 0;
  uint128 public constant A_AAVE_BASE_BALANCE_SLOT = 0;
  uint128 public constant A_AAVE_DELEGATED_STATE_SLOT = 0;

  constructor(address governanceToken) {
    require(governanceToken != address(0), 'INVALID_GOVERNANCE_TOKEN');
    GOVERNANCE_TOKEN = governanceToken;

    address[] memory votingAssetList = getVotingAssetList();

    require(votingAssetList.length != 0, Errors.NO_VOTING_ASSETS);

    for (uint256 i = 0; i < votingAssetList.length; i++) {
      for (uint256 j = i + 1; j < votingAssetList.length; j++) {
        require(
          votingAssetList[i] != votingAssetList[j],
          Errors.REPEATED_STRATEGY_ASSET
        );
      }

      VotingAssetConfig memory votingAssetConfig = getVotingAssetConfig(
        votingAssetList[i]
      );

      require(
        votingAssetConfig.storageSlots.length > 0,
        Errors.EMPTY_ASSET_STORAGE_SLOTS
      );

      for (uint256 k = 0; k < votingAssetConfig.storageSlots.length; k++) {
        for (
          uint256 l = k + 1;
          l < votingAssetConfig.storageSlots.length;
          l++
        ) {
          require(
            votingAssetConfig.storageSlots[k] !=
              votingAssetConfig.storageSlots[l],
            Errors.REPEATED_STRATEGY_ASSET_SLOT
          );
        }
      }

      emit VotingAssetAdd(votingAssetList[i], votingAssetConfig.storageSlots);
    }
  }

  function AAVE() public view virtual returns (address) {
    return GOVERNANCE_TOKEN;
  }

  function STK_AAVE() public pure virtual returns (address) {
    return address(0);
  }

  function A_AAVE() public pure virtual returns (address) {
    return address(0);
  }

  /// @inheritdoc IBaseVotingStrategy
  function getVotingAssetList() public view virtual returns (address[] memory) {
    address[] memory votingAssets = new address[](1);
    votingAssets[0] = AAVE();
    return votingAssets;
  }

  /// @inheritdoc IBaseVotingStrategy
  function getVotingAssetConfig(
    address asset
  ) public view virtual returns (VotingAssetConfig memory) {
    VotingAssetConfig memory votingAssetConfig;

    if (asset == AAVE()) {
      votingAssetConfig.storageSlots = new uint128[](1);
      votingAssetConfig.storageSlots[0] = BASE_BALANCE_SLOT;
    }

    return votingAssetConfig;
  }

  /// @inheritdoc IBaseVotingStrategy
  function isTokenSlotAccepted(
    address token,
    uint128 slot
  ) external view returns (bool) {
    VotingAssetConfig memory votingAssetConfig = getVotingAssetConfig(token);
    for (uint256 i = 0; i < votingAssetConfig.storageSlots.length; i++) {
      if (slot == votingAssetConfig.storageSlots[i]) {
        return true;
      }
    }
    return false;
  }
}
