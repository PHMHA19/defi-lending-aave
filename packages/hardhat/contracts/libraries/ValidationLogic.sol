// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";
import "./ReserveConfiguration.sol";
import "./GenericLogic.sol";

library ValidationLogic {


using ReserveConfiguration
    for ReserveConfiguration.Map;

/**
 * ---------------------------------------------------
 * HEALTH FACTOR THRESHOLD
 * ---------------------------------------------------
 */

uint256 internal constant
    HEALTH_FACTOR_LIQUIDATION_THRESHOLD =
        1e18;

/**
 * ---------------------------------------------------
 * VALIDATE SUPPLY
 * ---------------------------------------------------
 */

function validateSupply(
    DataTypes.ReserveData
        storage reserve,
    uint256 amount
) internal view {

    require(
        amount > 0,
        "INVALID_AMOUNT"
    );

    require(
        reserve
            .configuration
            .getActive(),
        "RESERVE_INACTIVE"
    );

    require(
        !reserve
            .configuration
            .getPaused(),
        "RESERVE_PAUSED"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE WITHDRAW
 * ---------------------------------------------------
 */

function validateWithdraw(
    uint256 userBalance,
    uint256 amount
) internal pure {

    require(
        amount > 0,
        "INVALID_AMOUNT"
    );

    require(
        userBalance >= amount,
        "INSUFFICIENT_BALANCE"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE BORROW
 * ---------------------------------------------------
 */

function validateBorrow(
    DataTypes.ReserveData
        storage reserve,
    GenericLogic
        .UserAccountData
            memory accountData,
    uint256 amount
) internal view {

    require(
        amount > 0,
        "INVALID_AMOUNT"
    );

    require(
        reserve
            .configuration
            .getActive(),
        "RESERVE_INACTIVE"
    );

    require(
        !reserve
            .configuration
            .getPaused(),
        "RESERVE_PAUSED"
    );

    require(
        reserve
            .configuration
            .getBorrowingEnabled(),
        "BORROWING_DISABLED"
    );

    require(
        reserve.totalSupplied >=
            reserve.totalBorrowed +
            amount,
        "NOT_ENOUGH_LIQUIDITY"
    );

    require(
        accountData
            .availableBorrowsBase >=
            amount,
        "COLLATERAL_CANNOT_COVER_NEW_BORROW"
    );

    require(
        accountData
            .healthFactor >=
            HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
        "HEALTH_FACTOR_TOO_LOW"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE REPAY
 * ---------------------------------------------------
 */

function validateRepay(
    uint256 userDebt,
    uint256 amount
) internal pure {

    require(
        amount > 0,
        "INVALID_AMOUNT"
    );

    require(
        userDebt > 0,
        "NO_DEBT"
    );

    require(
        amount <= userDebt,
        "INVALID_REPAY_AMOUNT"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE HEALTH FACTOR
 * ---------------------------------------------------
 */

function validateHealthFactor(
    uint256 healthFactor
) internal pure {

    require(
        healthFactor >=
        HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
        "HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE LIQUIDATION
 * ---------------------------------------------------
 */

function validateLiquidationCall(
    uint256 healthFactor
) internal pure {

    require(
        healthFactor <
        HEALTH_FACTOR_LIQUIDATION_THRESHOLD,
        "HEALTH_FACTOR_NOT_BELOW_THRESHOLD"
    );
}

/**
 * ---------------------------------------------------
 * VALIDATE USE AS COLLATERAL
 * ---------------------------------------------------
 */

function validateUseAsCollateral(
    DataTypes.ReserveData
        storage reserve
) internal view {

    require(
        reserve
            .configuration
            .getActive(),
        "RESERVE_INACTIVE"
    );

    require(
        !reserve
            .configuration
            .getPaused(),
        "RESERVE_PAUSED"
    );
}

}
