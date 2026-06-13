// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library WadRayMath {

uint256 internal constant
    WAD = 1e18;

uint256 internal constant
    HALF_WAD =
        0.5e18;

uint256 internal constant
    RAY = 1e27;

uint256 internal constant
    HALF_RAY =
        0.5e27;

uint256 internal constant
    WAD_RAY_RATIO =
        1e9;

/**
 * ---------------------------------------------------
 * WAD MUL
 * ---------------------------------------------------
 */

function wadMul(
    uint256 a,
    uint256 b
)
    internal
    pure
    returns (uint256)
{
    if (
        a == 0 ||
        b == 0
    ) {
        return 0;
    }

    return
        (
            a * b +
            HALF_WAD
        ) / WAD;
}

/**
 * ---------------------------------------------------
 * WAD DIV
 * ---------------------------------------------------
 */

function wadDiv(
    uint256 a,
    uint256 b
)
    internal
    pure
    returns (uint256)
{
    require(
        b != 0,
        "DIV_BY_ZERO"
    );

    return
        (
            a * WAD +
            b / 2
        ) / b;
}

/**
 * ---------------------------------------------------
 * RAY MUL
 * ---------------------------------------------------
 */

function rayMul(
    uint256 a,
    uint256 b
)
    internal
    pure
    returns (uint256)
{
    if (
        a == 0 ||
        b == 0
    ) {
        return 0;
    }

    return
        (
            a * b +
            HALF_RAY
        ) / RAY;
}

/**
 * ---------------------------------------------------
 * RAY DIV
 * ---------------------------------------------------
 */

function rayDiv(
    uint256 a,
    uint256 b
)
    internal
    pure
    returns (uint256)
{
    require(
        b != 0,
        "DIV_BY_ZERO"
    );

    return
        (
            a * RAY +
            b / 2
        ) / b;
}

/**
 * ---------------------------------------------------
 * WAD TO RAY
 * ---------------------------------------------------
 */

function wadToRay(
    uint256 a
)
    internal
    pure
    returns (uint256)
{
    return
        a *
        WAD_RAY_RATIO;
}

/**
 * ---------------------------------------------------
 * RAY TO WAD
 * ---------------------------------------------------
 */

function rayToWad(
    uint256 a
)
    internal
    pure
    returns (uint256)
{
    return
        (
            a +
            WAD_RAY_RATIO / 2
        ) /
        WAD_RAY_RATIO;
}

}
