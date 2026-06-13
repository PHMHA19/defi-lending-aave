// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";

library InterestLogic {

uint256 internal constant
    PRECISION = 1e18;

uint256 internal constant
    YEAR = 365 days;

/**
 * ---------------------------------------------------
 * CALCULATE LINEAR INTEREST
 * ---------------------------------------------------
 */

function calculateLinearInterest(
    uint256 rate,
    uint40 lastUpdateTimestamp
)
    internal
    view
    returns (uint256)
{
    uint256 timeDifference =
        block.timestamp -
        uint256(
            lastUpdateTimestamp
        );

    return
        PRECISION +

        (
            rate *
            timeDifference
        ) / YEAR;
}

/**
 * ---------------------------------------------------
 * CALCULATE COMPOUNDED INTEREST
 * ---------------------------------------------------
 */

function calculateCompoundedInterest(
    uint256 rate,
    uint40 lastUpdateTimestamp
)
    internal
    view
    returns (uint256)
{
    uint256 exp =
        block.timestamp -
        uint256(
            lastUpdateTimestamp
        );

    if (exp == 0) {
        return PRECISION;
    }

    uint256 expMinusOne =
        exp - 1;

    uint256 expMinusTwo =
        exp > 2
            ? exp - 2
            : 0;

    uint256 ratePerSecond =
        rate / YEAR;

    uint256 basePowerTwo =
        (
            ratePerSecond *
            ratePerSecond
        ) / PRECISION;

    uint256 basePowerThree =
        (
            basePowerTwo *
            ratePerSecond
        ) / PRECISION;

    uint256 secondTerm =
        (
            exp *
            expMinusOne *
            basePowerTwo
        ) / 2;

    uint256 thirdTerm =
        (
            exp *
            expMinusOne *
            expMinusTwo *
            basePowerThree
        ) / 6;

    return
        PRECISION +

        (
            ratePerSecond *
            exp
        ) +

        secondTerm +

        thirdTerm;
}

/**
 * ---------------------------------------------------
 * UPDATE STATE
 * ---------------------------------------------------
 */

function updateState(
    DataTypes.ReserveData
        storage reserve
) internal {

    if (
        reserve
            .lastUpdateTimestamp ==
        uint40(block.timestamp)
    ) {
        return;
    }

    /**
     * ---------------------------------------------------
     * UPDATE LIQUIDITY INDEX
     * ---------------------------------------------------
     */

    uint256 cumulatedLiquidityInterest =
        calculateLinearInterest(
            reserve
                .currentLiquidityRate,

            reserve
                .lastUpdateTimestamp
        );

    reserve.liquidityIndex = uint128(
        (
            reserve.liquidityIndex *
            cumulatedLiquidityInterest
        ) / PRECISION
        );

    /**
     * ---------------------------------------------------
     * UPDATE BORROW INDEX
     * ---------------------------------------------------
     */

    uint256 cumulatedBorrowInterest =
        calculateCompoundedInterest(
            reserve
                .currentVariableBorrowRate,

            reserve
                .lastUpdateTimestamp
        );

    reserve.borrowIndex = uint128(
        (
            reserve.borrowIndex *
            cumulatedBorrowInterest
        ) / PRECISION
        );

    /**
     * ---------------------------------------------------
     * UPDATE TIMESTAMP
     * ---------------------------------------------------
     */

    reserve
        .lastUpdateTimestamp =
            uint40(
                block.timestamp
            );
}
}
