// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";
import "./ReserveConfiguration.sol";
import "./UserConfiguration.sol";

library GenericLogic {

using ReserveConfiguration
    for ReserveConfiguration.Map;

using UserConfiguration
    for DataTypes.UserConfigurationMap;

uint256 internal constant
    PRECISION = 1e18;

/**
 * ---------------------------------------------------
 * USER ACCOUNT DATA
 * ---------------------------------------------------
 */

struct UserAccountData {

    uint256 totalCollateralBase;

    uint256 totalDebtBase;

    uint256 availableBorrowsBase;

    uint256 currentLiquidationThreshold;

    uint256 ltv;

    uint256 healthFactor;
}

/**
 * ---------------------------------------------------
 * CALCULATE USER ACCOUNT DATA
 * ---------------------------------------------------
 */

function calculateUserAccountData(
    mapping(
        address =>
            DataTypes.ReserveData
    ) storage reserves,

    address[] storage reserveList,

    mapping(
        address =>
            mapping(
                address =>
                    DataTypes
                        .UserReserveData
            )
    ) storage userPositions,

    mapping(
        address =>
            DataTypes.UserConfigurationMap
    ) storage userConfig,

    address user,

    function(address)
        view
        returns (uint256)
            getPrice
)
    internal
    view
    returns (
        UserAccountData memory
    )
{
    UserAccountData
        memory vars;

    uint256 weightedLtv = 0;

    uint256 weightedLiquidationThreshold =
        0;

    /**
     * ---------------------------------------------------
     * LOOP RESERVES
     * ---------------------------------------------------
     */

    for (
        uint256 i = 0;
        i < reserveList.length;
        i++
    ) {

        address asset =
            reserveList[i];

        DataTypes.ReserveData
            storage reserve =
                reserves[asset];

        uint256 price =
            getPrice(asset);

        /**
         * ---------------------------------------------------
         * COLLATERAL
         * ---------------------------------------------------
         */

        if (
            userConfig[user]
                .isUsingAsCollateral(
                    reserve.id
                )
        ) {

            uint256 supplied =
                (
                    userPositions[user]
                        [asset]
                            .scaledSupply *
                    reserve
                        .liquidityIndex
                ) / PRECISION;

            uint256 collateralBase =
                (
                    supplied *
                    price
                ) / PRECISION;

            vars
                .totalCollateralBase +=
                    collateralBase;

            weightedLtv +=
                (
                    collateralBase *
                    reserve
                        .configuration
                        .getLtv()
                );

            weightedLiquidationThreshold +=
                (
                    collateralBase *
                    reserve
                        .configuration
                        .getLiquidationThreshold()
                );
        }

        /**
         * ---------------------------------------------------
         * BORROW
         * ---------------------------------------------------
         */

        if (
            userConfig[user]
                .isBorrowing(
                    reserve.id
                )
        ) {

            uint256 borrowed =
                (
                    userPositions[user]
                        [asset]
                            .scaledBorrow *
                    reserve
                        .borrowIndex
                ) / PRECISION;

            vars.totalDebtBase +=
                (
                    borrowed *
                    price
                ) / PRECISION;
        }
    }

    /**
     * ---------------------------------------------------
     * WEIGHTED LTV
     * ---------------------------------------------------
     */

    if (
        vars.totalCollateralBase >
        0
    ) {

        vars.ltv =
            weightedLtv /
            vars
                .totalCollateralBase;

        vars
            .currentLiquidationThreshold =
                weightedLiquidationThreshold /
                vars
                    .totalCollateralBase;
    }

    /**
     * ---------------------------------------------------
     * AVAILABLE BORROW
     * ---------------------------------------------------
     */

    uint256 borrowPower =
        (
            vars
                .totalCollateralBase *
            vars.ltv
        ) / 10000;

    if (
        borrowPower >
        vars.totalDebtBase
    ) {

        vars.availableBorrowsBase =
            borrowPower -
            vars.totalDebtBase;
    }

    /**
     * ---------------------------------------------------
     * HEALTH FACTOR
     * ---------------------------------------------------
     */

    vars.healthFactor =
        calculateHealthFactor(
            vars
                .totalCollateralBase,

            vars
                .totalDebtBase,

            vars
                .currentLiquidationThreshold
        );

    return vars;
}

/**
 * ---------------------------------------------------
 * HEALTH FACTOR
 * ---------------------------------------------------
 */

function calculateHealthFactor(
    uint256 collateralBase,
    uint256 debtBase,
    uint256 liquidationThreshold
)
    internal
    pure
    returns (uint256)
{
    if (debtBase == 0) {

        return
            type(uint256).max;
    }

    uint256 adjustedCollateral =
        (
            collateralBase *
            liquidationThreshold
        ) / 10000;

    return
        (
            adjustedCollateral *
            PRECISION
        ) / debtBase;
}

}
