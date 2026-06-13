// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DefaultReserveInterestRateStrategy {

uint256 public constant
    PRECISION = 1e18;

/**
 * ---------------------------------------------------
 * BASE VARIABLE BORROW RATE
 * ---------------------------------------------------
 */

uint256 public immutable
    baseVariableBorrowRate;

/**
 * ---------------------------------------------------
 * OPTIMAL UTILIZATION
 * ---------------------------------------------------
 */

uint256 public immutable
    optimalUtilizationRate;

/**
 * ---------------------------------------------------
 * SLOPE 1
 * ---------------------------------------------------
 */

uint256 public immutable
    variableRateSlope1;

/**
 * ---------------------------------------------------
 * SLOPE 2
 * ---------------------------------------------------
 */

uint256 public immutable
    variableRateSlope2;

constructor(
    uint256 baseRate,
    uint256 optimalUtilization,
    uint256 slope1,
    uint256 slope2
) {

    baseVariableBorrowRate =
        baseRate;

    optimalUtilizationRate =
        optimalUtilization;

    variableRateSlope1 =
        slope1;

    variableRateSlope2 =
        slope2;
}

/**
 * ---------------------------------------------------
 * UTILIZATION RATE
 * ---------------------------------------------------
 */

function calculateUtilizationRate(
    uint256 totalDebt,
    uint256 totalLiquidity
)
    public
    pure
    returns (uint256)
{
    if (totalLiquidity == 0) {
        return 0;
    }

    return
        (
            totalDebt *
            PRECISION
        ) / totalLiquidity;
}

/**
 * ---------------------------------------------------
 * VARIABLE BORROW RATE
 * ---------------------------------------------------
 */

function calculateBorrowRate(
    uint256 utilization
)
    public
    view
    returns (uint256)
{
    /**
     * below optimal
     */

    if (
        utilization <=
        optimalUtilizationRate
    ) {

        return
            baseVariableBorrowRate +

            (
                utilization *
                variableRateSlope1
            ) /
            optimalUtilizationRate;
    }

    /**
     * above optimal
     */

    uint256 excessUtilization =
        utilization -
        optimalUtilizationRate;

    uint256 excessRatio =
        (
            excessUtilization *
            PRECISION
        ) /
        (
            PRECISION -
            optimalUtilizationRate
        );

    return
        baseVariableBorrowRate +

        variableRateSlope1 +

        (
            variableRateSlope2 *
            excessRatio
        ) / PRECISION;
}

/**
 * ---------------------------------------------------
 * LIQUIDITY RATE
 * ---------------------------------------------------
 */

function calculateLiquidityRate(
    uint256 borrowRate,
    uint256 utilization
)
    public
    pure
    returns (uint256)
{
    return
        (
            borrowRate *
            utilization
        ) / PRECISION;
}


}
