// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {IGovernancePowerStrategy} from '../interfaces/IGovernancePowerStrategy.sol';
import {BaseVotingStrategy} from './BaseVotingStrategy.sol';

/**
 * @title GovernancePowerStrategy
 * @author BGD Labs
 * @notice This contract computes governance power from the configured governance token.
 */
contract GovernancePowerStrategy is
  BaseVotingStrategy,
  IGovernancePowerStrategy
{
  constructor(address governanceToken) BaseVotingStrategy(governanceToken) {}

  /// @inheritdoc IGovernancePowerStrategy
  function getFullVotingPower(address user) external view returns (uint256) {
    return _getPower(user);
  }

  /// @inheritdoc IGovernancePowerStrategy
  function getFullPropositionPower(
    address user
  ) external view override returns (uint256) {
    return _getPower(user);
  }

  function _getPower(address user) internal view returns (uint256) {
    address[] memory votingAssetList = getVotingAssetList();

    if (votingAssetList.length == 0) {
      return 0;
    }

    address asset = votingAssetList[0];
    if (asset == address(0)) {
      return 0;
    }

    (bool ok, bytes memory data) = asset.staticcall(
      abi.encodeWithSignature('balanceOf(address)', user)
    );

    if (!ok || data.length == 0) {
      return 0;
    }

    return abi.decode(data, (uint256));
  }
}
