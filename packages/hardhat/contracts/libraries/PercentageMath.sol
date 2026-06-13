// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PercentageMath {
/**
 * ---------------------------------------------------
 * PERCENTAGE FACTOR
 * ---------------------------------------------------
 */

uint256 internal constant
    PERCENTAGE_FACTOR =
        1e4;

uint256 internal constant
    HALF_PERCENTAGE_FACTOR =
        0.5e4;

/**
 * ---------------------------------------------------
 * PERCENT MUL
 * ---------------------------------------------------
 */

function percentMul(
    uint256 value,
    uint256 percentage
)
    internal
    pure
    returns (uint256)
{
    if (
        value == 0 ||
        percentage == 0
    ) {
        return 0;
    }

    return
        (
            value *
            percentage +
            HALF_PERCENTAGE_FACTOR
        ) /
        PERCENTAGE_FACTOR;
}

/**
 * ---------------------------------------------------
 * PERCENT DIV
 * ---------------------------------------------------
 */

function percentDiv(
    uint256 value,
    uint256 percentage
)
    internal
    pure
    returns (uint256)
{
    require(
        percentage != 0,
        "DIV_BY_ZERO"
    );

    return
        (
            value *
            PERCENTAGE_FACTOR +
            percentage / 2
        ) /
        percentage;
}

}
