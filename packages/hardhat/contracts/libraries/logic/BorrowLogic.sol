// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../DataTypes.sol";
import "../ValidationLogic.sol";
import "../InterestLogic.sol";
import "../GenericLogic.sol";
import "../UserConfiguration.sol";

import "../../tokenization/VariableDebtToken.sol";
import "../../tokenization/StableDebtToken.sol";

library BorrowLogic {

using UserConfiguration
    for DataTypes.UserConfigurationMap;

/**
 * ---------------------------------------------------
 * INTEREST RATE MODES
 * ---------------------------------------------------
 */

uint256 internal constant
    STABLE = 1;

uint256 internal constant
    VARIABLE = 2;

/**
 * ---------------------------------------------------
 * EVENTS
 * ---------------------------------------------------
 */

event Borrow(
    address indexed reserve,
    address user,
    address indexed onBehalfOf,
    uint256 amount,
    uint256 interestRateMode,
    uint256 borrowRate,
    uint16 indexed referralCode
);

event Repay(
    address indexed reserve,
    address indexed user,
    address indexed repayer,
    uint256 amount
);

/**
 * ---------------------------------------------------
 * EXECUTE BORROW
 * ---------------------------------------------------
 */

function executeBorrow(
    mapping(address => DataTypes.ReserveData)
        storage reserves,

    address[] storage reserveList,

    mapping(address => DataTypes.UserConfigurationMap)
        storage userConfig,

    mapping(address => address)
        storage variableDebtTokens,

    mapping(address => address)
        storage stableDebtTokens,

    mapping(
        address =>
            mapping(
                address =>
                    DataTypes.UserReserveData
            )
    )
        storage usersReserveData,

    address asset,

    address user,

    address onBehalfOf,

    uint256 amount,

    uint256 interestRateMode,

    uint16 referralCode,

    function(address)
        view
        returns (uint256)
            getPrice
) internal {

    DataTypes.ReserveData
        storage reserve =
            reserves[asset];

    /**
     * ---------------------------------------------------
     * USER ACCOUNT DATA
     * ---------------------------------------------------
     */

    GenericLogic.UserAccountData
        memory accountData =
            GenericLogic
                .calculateUserAccountData(
                    reserves,
                    reserveList,
                    usersReserveData,
                    userConfig,
                    onBehalfOf,
                    getPrice
                );

    /**
     * ---------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------
     */

    ValidationLogic
        .validateBorrow(
            reserve,
            accountData,
            amount
        );

    /**
     * ---------------------------------------------------
     * UPDATE RESERVE STATE
     * ---------------------------------------------------
     */

    InterestLogic
        .updateState(
            reserve
        );

    /**
     * ---------------------------------------------------
     * UPDATE TOTAL BORROWED
     * ---------------------------------------------------
     */

    reserve.totalBorrowed +=
        amount;

    /**
     * ---------------------------------------------------
     * VARIABLE RATE BORROW
     * ---------------------------------------------------
     */

    if (
        interestRateMode ==
        VARIABLE
    ) {

        VariableDebtToken(
            variableDebtTokens[
                asset
            ]
        ).mint(
            user,
            onBehalfOf,
            amount,
            reserve.borrowIndex
        );

    }
    /**
     * ---------------------------------------------------
     * STABLE RATE BORROW
     * ---------------------------------------------------
     */
    else {

        StableDebtToken(
            stableDebtTokens[
                asset
            ]
        ).mint(
            user,
            onBehalfOf,
            amount,
            reserve
                .currentVariableBorrowRate
        );
    }

    /**
     * ---------------------------------------------------
     * UPDATE USER DEBT
     * ---------------------------------------------------
     */

    usersReserveData[
        onBehalfOf
    ][asset]
        .scaledBorrow +=
            amount;

    /**
     * ---------------------------------------------------
     * USER CONFIGURATION
     * ---------------------------------------------------
     */

    userConfig[
        onBehalfOf
    ].setBorrowing(
        reserve.id,
        true
    );

    /**
     * ---------------------------------------------------
     * EVENTS
     * ---------------------------------------------------
     */

    emit Borrow(
        asset,
        user,
        onBehalfOf,
        amount,
        interestRateMode,
        reserve
            .currentVariableBorrowRate,
        referralCode
    );
}

/**
 * ---------------------------------------------------
 * EXECUTE REPAY
 * ---------------------------------------------------
 */

function executeRepay(
    mapping(address => DataTypes.ReserveData)
        storage reserves,

    mapping(address => DataTypes.UserConfigurationMap)
        storage userConfig,

    mapping(address => address)
        storage variableDebtTokens,

    mapping(address => address)
        storage stableDebtTokens,

    mapping(
        address =>
            mapping(
                address =>
                    DataTypes.UserReserveData
            )
    )
        storage usersReserveData,

    address asset,

    address user,

    uint256 amount,

    uint256 interestRateMode
)
    internal
    returns (uint256)
{
    DataTypes.ReserveData
        storage reserve =
            reserves[asset];

    /**
     * ---------------------------------------------------
     * UPDATE RESERVE STATE
     * ---------------------------------------------------
     */

    InterestLogic
        .updateState(
            reserve
        );

    /**
     * ---------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------
     */

    ValidationLogic
        .validateRepay(
            usersReserveData[
                user
            ][asset]
                .scaledBorrow,
            amount
        );

    /**
     * ---------------------------------------------------
     * UPDATE TOTAL BORROWED
     * ---------------------------------------------------
     */

    reserve.totalBorrowed -=
        amount;

    /**
     * ---------------------------------------------------
     * VARIABLE REPAY
     * ---------------------------------------------------
     */

    if (
        interestRateMode ==
        VARIABLE
    ) {

        VariableDebtToken(
            variableDebtTokens[
                asset
            ]
        ).burn(
            user,
            amount,
            reserve.borrowIndex
        );

    }
    /**
     * ---------------------------------------------------
     * STABLE REPAY
     * ---------------------------------------------------
     */
    else {

        StableDebtToken(
            stableDebtTokens[
                asset
            ]
        ).burn(
            user,
            amount
        );
    }

    /**
     * ---------------------------------------------------
     * UPDATE USER DATA
     * ---------------------------------------------------
     */

    usersReserveData[
        user
    ][asset]
        .scaledBorrow -=
            amount;

    /**
     * ---------------------------------------------------
     * UPDATE USER CONFIG
     * ---------------------------------------------------
     */

    if (
        usersReserveData[
            user
        ][asset]
            .scaledBorrow == 0
    ) {

        userConfig[user]
            .setBorrowing(
                reserve.id,
                false
            );
    }

    emit Repay(
        asset,
        user,
        user,
        amount
    );

    return amount;
}


}
