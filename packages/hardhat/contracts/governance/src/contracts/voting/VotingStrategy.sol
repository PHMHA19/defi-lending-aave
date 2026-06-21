// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {BaseVotingStrategy} from '../BaseVotingStrategy.sol';
import {IVotingStrategy, IDataWarehouse} from './interfaces/IVotingStrategy.sol';
import {Errors} from '../libraries/Errors.sol';

/**
 * @title VotingStrategy
 * @author BGD Labs
 * @notice This contract computes voting power for the configured governance token.
 */
contract VotingStrategy is BaseVotingStrategy, IVotingStrategy {
  /// @inheritdoc IVotingStrategy
  IDataWarehouse public immutable DATA_WAREHOUSE;

  /// @inheritdoc IVotingStrategy
  uint256 public constant STK_AAVE_SLASHING_EXCHANGE_RATE_PRECISION = 1e18;

  /// @inheritdoc IVotingStrategy
  uint256 public constant STK_AAVE_SLASHING_EXCHANGE_RATE_SLOT = 81;

  /// @inheritdoc IVotingStrategy
  uint256 public constant POWER_SCALE_FACTOR = 1e10;

  /**
   * @param dataWarehouse address of the DataWarehouse contract used to store roots
   * @param governanceToken address of the configured governance token
   */
  constructor(
    address dataWarehouse,
    address governanceToken
  ) BaseVotingStrategy(governanceToken) {
    require(dataWarehouse != address(0), Errors.INVALID_DATA_WAREHOUSE);
    DATA_WAREHOUSE = IDataWarehouse(dataWarehouse);
  }

  /// @inheritdoc IVotingStrategy
  function getVotingPower(
    address asset,
    uint128 storageSlot,
    uint256 power,
    bytes32 /* blockHash */
  ) public view override returns (uint256) {
    if (asset != AAVE() || storageSlot != BASE_BALANCE_SLOT) {
      return 0;
    }

    // For the single-token governance setup, voting power is the raw token balance.
    return power;
  }

  // @inheritdoc IVotingStrategy
  function hasRequiredRoots(
    bytes32 blockHash
  ) external view override {
    require(
      DATA_WAREHOUSE.getStorageRoots(AAVE(), blockHash) != bytes32(0),
      Errors.MISSING_AAVE_ROOTS
    );
  }
}
