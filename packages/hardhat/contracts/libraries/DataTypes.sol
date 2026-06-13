// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReserveConfiguration.sol";

library DataTypes {

/**
 * ---------------------------------------------------
 * RESERVE DATA
 * ---------------------------------------------------
 */

struct ReserveData {

    /**
     * reserve id
     */

    uint16 id;

    /**
     * reserve configuration bitmap
     */

    ReserveConfiguration.Map
        configuration;

    /**
     * liquidity index
     */

    uint128 liquidityIndex;

    /**
     * current liquidity rate
     */

    uint128 currentLiquidityRate;

    /**
     * variable borrow index
     */

    uint128 borrowIndex;

    /**
     * current variable borrow rate
     */

    uint128 currentVariableBorrowRate;

    /**
     * last update timestamp
     */

    uint40 lastUpdateTimestamp;

    /**
     * aToken address
     */

    address aTokenAddress;

    /**
     * stable debt token address
     */

    address stableDebtTokenAddress;

    /**
     * variable debt token address
     */

    address variableDebtTokenAddress;

    /**
     * interest rate strategy
     */

    address interestRateStrategyAddress;

    /**
     * treasury accrual
     */

    uint128 accruedToTreasury;

    /**
     * isolation mode debt
     */

    uint128 isolationModeTotalDebt;

    /**
     * total supplied liquidity
     */

    uint256 totalSupplied;

    /**
     * total borrowed liquidity
     */

    uint256 totalBorrowed;
}

/**
 * ---------------------------------------------------
 * RESERVE CACHE
 * ---------------------------------------------------
 */

struct ReserveCache {

    /**
     * current scaled variable debt
     */

    uint256 currScaledVariableDebt;

    /**
     * next scaled variable debt
     */

    uint256 nextScaledVariableDebt;

    /**
     * current principal stable debt
     */

    uint256 currPrincipalStableDebt;

    /**
     * current average stable borrow rate
     */

    uint256 currAvgStableBorrowRate;

    /**
     * current total stable debt
     */

    uint256 currTotalStableDebt;

    /**
     * next average stable borrow rate
     */

    uint256 nextAvgStableBorrowRate;

    /**
     * next total stable debt
     */

    uint256 nextTotalStableDebt;

    /**
     * current liquidity index
     */

    uint256 currLiquidityIndex;

    /**
     * next liquidity index
     */

    uint256 nextLiquidityIndex;

    /**
     * current variable borrow index
     */

    uint256 currVariableBorrowIndex;

    /**
     * next variable borrow index
     */

    uint256 nextVariableBorrowIndex;

    /**
     * current liquidity rate
     */

    uint256 currLiquidityRate;

    /**
     * current variable borrow rate
     */

    uint256 currVariableBorrowRate;

    /**
     * reserve factor
     */

    uint256 reserveFactor;

    /**
     * reserve last update timestamp
     */

    uint40 reserveLastUpdateTimestamp;
}

/**
 * ---------------------------------------------------
 * USER RESERVE DATA
 * ---------------------------------------------------
 */

struct UserReserveData {

    /**
     * scaled supplied balance
     */

    uint256 scaledSupply;

    /**
     * scaled borrowed balance
     */

    uint256 scaledBorrow;

    /**
     * collateral usage
     */

    bool useAsCollateral;
}

/**
 * ---------------------------------------------------
 * USER CONFIGURATION MAP
 * ---------------------------------------------------
 */

struct UserConfigurationMap {

    uint256 data;
}

/**
 * ---------------------------------------------------
 * EXECUTE SUPPLY PARAMS
 * ---------------------------------------------------
 */

struct ExecuteSupplyParams {

    address asset;

    uint256 amount;

    address onBehalfOf;

    uint16 referralCode;
}

/**
 * ---------------------------------------------------
 * EXECUTE BORROW PARAMS
 * ---------------------------------------------------
 */

struct ExecuteBorrowParams {

    address asset;

    address user;

    address onBehalfOf;

    uint256 amount;

    uint256 interestRateMode;

    uint16 referralCode;
}

/**
 * ---------------------------------------------------
 * EXECUTE REPAY PARAMS
 * ---------------------------------------------------
 */

struct ExecuteRepayParams {

    address asset;

    uint256 amount;

    uint256 interestRateMode;

    address user;
}

/**
 * ---------------------------------------------------
 * EXECUTE WITHDRAW PARAMS
 * ---------------------------------------------------
 */

struct ExecuteWithdrawParams {

    address asset;

    uint256 amount;

    address to;
}

/**
 * ---------------------------------------------------
 * EXECUTE LIQUIDATION PARAMS
 * ---------------------------------------------------
 */

struct ExecuteLiquidationCallParams {

    address collateralAsset;

    address debtAsset;

    address user;

    uint256 debtToCover;

    bool receiveAToken;
}

}
