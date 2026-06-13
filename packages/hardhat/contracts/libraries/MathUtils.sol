// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WadRayMath.sol";

library MathUtils {

using WadRayMath
    for uint256;

uint256 internal constant
    SECONDS_PER_YEAR =
        365 days;

/**
 * ---------------------------------------------------
 * LINEAR INTEREST
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
        WadRayMath.RAY +
        (
            rate *
            timeDifference
        ) /
        SECONDS_PER_YEAR;
}

/**
 * ---------------------------------------------------
 * COMPOUNDED INTEREST
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
        return WadRayMath.RAY;
    }

    uint256 expMinusOne =
        exp - 1;

    uint256 expMinusTwo =
        exp > 2
            ? exp - 2
            : 0;

    uint256 ratePerSecond =
        rate /
        SECONDS_PER_YEAR;

    uint256 basePowerTwo =
        ratePerSecond
            .rayMul(
                ratePerSecond
            );

    uint256 basePowerThree =
        basePowerTwo
            .rayMul(
                ratePerSecond
            );

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
        WadRayMath.RAY +
        (
            ratePerSecond *
            exp
        ) +
        secondTerm +
        thirdTerm;
}

}
