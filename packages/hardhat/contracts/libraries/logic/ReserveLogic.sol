// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../DataTypes.sol";
import "../ReserveConfiguration.sol";

import "../../tokenization/VariableDebtToken.sol";
import "../../tokenization/StableDebtToken.sol";

library ReserveLogic {

using ReserveConfiguration
    for ReserveConfiguration.Map;

/**
 * ---------------------------------------------------
 * CACHE
 * ---------------------------------------------------
 */

function cache(
    DataTypes.ReserveData
        storage reserve
)
    internal
    view
    returns (
        DataTypes.ReserveCache memory
    )
{
    DataTypes
        .ReserveCache
            memory reserveCache;

    /**
     * ---------------------------------------------------
     * INDEXES
     * ---------------------------------------------------
     */

    reserveCache
        .currLiquidityIndex =
            reserve
                .liquidityIndex;

    reserveCache
        .nextLiquidityIndex =
            reserve
                .liquidityIndex;

    reserveCache
        .currVariableBorrowIndex =
            reserve
                .borrowIndex;

    reserveCache
        .nextVariableBorrowIndex =
            reserve
                .borrowIndex;

    /**
     * ---------------------------------------------------
     * RATES
     * ---------------------------------------------------
     */

    reserveCache
        .currLiquidityRate =
            reserve
                .currentLiquidityRate;

    reserveCache
        .currVariableBorrowRate =
            reserve
                .currentVariableBorrowRate;

    reserveCache
        .reserveFactor =
            reserve
                .configuration
                .getReserveFactor();

    /**
     * ---------------------------------------------------
     * TIMESTAMP
     * ---------------------------------------------------
     */

    reserveCache
        .reserveLastUpdateTimestamp =
            reserve
                .lastUpdateTimestamp;

    /**
     * ---------------------------------------------------
     * VARIABLE DEBT
     * ---------------------------------------------------
     */

    reserveCache
        .currScaledVariableDebt =
            VariableDebtToken(
                reserve
                    .variableDebtTokenAddress
            ).scaledTotalSupply();

    reserveCache
        .nextScaledVariableDebt =
            reserveCache
                .currScaledVariableDebt;

    /**
     * ---------------------------------------------------
     * STABLE DEBT
     * ---------------------------------------------------
     */

    reserveCache
        .currPrincipalStableDebt =
            StableDebtToken(
                reserve
                    .stableDebtTokenAddress
            ).principalBalanceOf(
                address(this)
            );

    reserveCache
        .currAvgStableBorrowRate =
            StableDebtToken(
                reserve
                    .stableDebtTokenAddress
            ).getAverageStableRate();

    reserveCache
        .currTotalStableDebt =
            StableDebtToken(
                reserve
                    .stableDebtTokenAddress
            ).totalSupply();

    reserveCache
        .nextAvgStableBorrowRate =
            reserveCache
                .currAvgStableBorrowRate;

    reserveCache
        .nextTotalStableDebt =
            reserveCache
                .currTotalStableDebt;

    return reserveCache;
}


}
