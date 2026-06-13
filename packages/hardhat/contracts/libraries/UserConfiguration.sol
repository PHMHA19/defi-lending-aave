// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DataTypes.sol";

library UserConfiguration {

/**
 * ---------------------------------------------------
 * BORROWING MASK
 * ---------------------------------------------------
 */

uint256 internal constant
    BORROWING_MASK =
        0x5555555555555555555555555555555555555555555555555555555555555555;

/**
 * ---------------------------------------------------
 * COLLATERAL MASK
 * ---------------------------------------------------
 */

uint256 internal constant
    COLLATERAL_MASK =
        0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA;

/**
 * ---------------------------------------------------
 * SET BORROWING
 * ---------------------------------------------------
 */

function setBorrowing(
    DataTypes.UserConfigurationMap
        storage self,
    uint256 reserveIndex,
    bool borrowing
) internal {

    uint256 bit =
        1 <<
        (
            reserveIndex << 1
        );

    if (borrowing) {

        self.data |= bit;

    } else {

        self.data &= ~bit;
    }
}

/**
 * ---------------------------------------------------
 * SET USING AS COLLATERAL
 * ---------------------------------------------------
 */

function setUsingAsCollateral(
    DataTypes.UserConfigurationMap
        storage self,
    uint256 reserveIndex,
    bool usingAsCollateral
) internal {

    uint256 bit =
        1 <<
        (
            (
                reserveIndex << 1
            ) + 1
        );

    if (
        usingAsCollateral
    ) {

        self.data |= bit;

    } else {

        self.data &= ~bit;
    }
}

/**
 * ---------------------------------------------------
 * IS BORROWING
 * ---------------------------------------------------
 */

function isBorrowing(
    DataTypes.UserConfigurationMap
        memory self,
    uint256 reserveIndex
)
    internal
    pure
    returns (bool)
{
    return
        (
            self.data >>
            (
                reserveIndex << 1
            )
        ) &
        1 != 0;
}

/**
 * ---------------------------------------------------
 * IS USING AS COLLATERAL
 * ---------------------------------------------------
 */

function isUsingAsCollateral(
    DataTypes.UserConfigurationMap
        memory self,
    uint256 reserveIndex
)
    internal
    pure
    returns (bool)
{
    return
        (
            self.data >>
            (
                (
                    reserveIndex << 1
                ) + 1
            )
        ) &
        1 != 0;
}

/**
 * ---------------------------------------------------
 * IS EMPTY
 * ---------------------------------------------------
 */

function isEmpty(
    DataTypes.UserConfigurationMap
        memory self
)
    internal
    pure
    returns (bool)
{
    return
        self.data == 0;
}

/**
 * ---------------------------------------------------
 * IS BORROWING ANY
 * ---------------------------------------------------
 */

function isBorrowingAny(
    DataTypes.UserConfigurationMap
        memory self
)
    internal
    pure
    returns (bool)
{
    return
        self.data &
        BORROWING_MASK != 0;
}

/**
 * ---------------------------------------------------
 * IS USING AS COLLATERAL ANY
 * ---------------------------------------------------
 */

function isUsingAsCollateralAny(
    DataTypes.UserConfigurationMap
        memory self
)
    internal
    pure
    returns (bool)
{
    return
        self.data &
        COLLATERAL_MASK != 0;
}

}
