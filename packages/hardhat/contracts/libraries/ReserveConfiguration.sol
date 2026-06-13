// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ReserveConfiguration {

struct Map {

    uint256 data;
}

/**
 * ---------------------------------------------------
 * BIT POSITIONS
 * ---------------------------------------------------
 */

uint256 internal constant
    LTV_START_BIT_POSITION =
        0;

uint256 internal constant
    LIQUIDATION_THRESHOLD_START_BIT_POSITION =
        16;

uint256 internal constant
    LIQUIDATION_BONUS_START_BIT_POSITION =
        32;

uint256 internal constant
    DECIMALS_START_BIT_POSITION =
        48;

uint256 internal constant
    ACTIVE_START_BIT_POSITION =
        56;

uint256 internal constant
    FROZEN_START_BIT_POSITION =
        57;

uint256 internal constant
    BORROWING_START_BIT_POSITION =
        58;

uint256 internal constant
    PAUSED_START_BIT_POSITION =
        60;

uint256 internal constant
    RESERVE_FACTOR_START_BIT_POSITION =
        64;

/**
 * ---------------------------------------------------
 * MASKS
 * ---------------------------------------------------
 */

uint256 internal constant
    LTV_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000;

uint256 internal constant
    LIQUIDATION_THRESHOLD_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000FFFF;

uint256 internal constant
    LIQUIDATION_BONUS_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000FFFFFFFFFFFFFFFF;

uint256 internal constant
    DECIMALS_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00FFFFFFFFFFFFFFFFFFFF;

uint256 internal constant
    ACTIVE_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFF;

uint256 internal constant
    FROZEN_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDFFFFFFFFFFFFFFFFFFFFFF;

uint256 internal constant
    BORROWING_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFBFFFFFFFFFFFFFFFFFFFFFF;

uint256 internal constant
    PAUSED_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFF;

uint256 internal constant
    RESERVE_FACTOR_MASK =
        0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000FFFFFFFFFFFF;

/**
 * ---------------------------------------------------
 * SET LTV
 * ---------------------------------------------------
 */

function setLtv(
    Map storage self,
    uint256 ltv
) internal {

    self.data =
        (
            self.data &
            LTV_MASK
        ) |
        (
            ltv <<
            LTV_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET LTV
 * ---------------------------------------------------
 */

function getLtv(
    Map memory self
)
    internal
    pure
    returns (uint256)
{
    return
        (
            self.data &
            ~LTV_MASK
        ) >>
        LTV_START_BIT_POSITION;
}

/**
 * ---------------------------------------------------
 * SET LIQUIDATION THRESHOLD
 * ---------------------------------------------------
 */

function setLiquidationThreshold(
    Map storage self,
    uint256 threshold
) internal {

    self.data =
        (
            self.data &
            LIQUIDATION_THRESHOLD_MASK
        ) |
        (
            threshold <<
            LIQUIDATION_THRESHOLD_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET LIQUIDATION THRESHOLD
 * ---------------------------------------------------
 */

function getLiquidationThreshold(
    Map memory self
)
    internal
    pure
    returns (uint256)
{
    return
        (
            self.data &
            ~LIQUIDATION_THRESHOLD_MASK
        ) >>
        LIQUIDATION_THRESHOLD_START_BIT_POSITION;
}

/**
 * ---------------------------------------------------
 * SET LIQUIDATION BONUS
 * ---------------------------------------------------
 */

function setLiquidationBonus(
    Map storage self,
    uint256 bonus
) internal {

    self.data =
        (
            self.data &
            LIQUIDATION_BONUS_MASK
        ) |
        (
            bonus <<
            LIQUIDATION_BONUS_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET LIQUIDATION BONUS
 * ---------------------------------------------------
 */

function getLiquidationBonus(
    Map memory self
)
    internal
    pure
    returns (uint256)
{
    return
        (
            self.data &
            ~LIQUIDATION_BONUS_MASK
        ) >>
        LIQUIDATION_BONUS_START_BIT_POSITION;
}

/**
 * ---------------------------------------------------
 * SET ACTIVE
 * ---------------------------------------------------
 */

function setActive(
    Map storage self,
    bool active
) internal {

    self.data =
        (
            self.data &
            ACTIVE_MASK
        ) |
        (
            uint256(active ? 1 : 0)
            << ACTIVE_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET ACTIVE
 * ---------------------------------------------------
 */

function getActive(
    Map memory self
)
    internal
    pure
    returns (bool)
{
    return
        (
            self.data >>
            ACTIVE_START_BIT_POSITION
        ) & 1 != 0;
}

/**
 * ---------------------------------------------------
 * SET BORROWING ENABLED
 * ---------------------------------------------------
 */

function setBorrowingEnabled(
    Map storage self,
    bool enabled
) internal {

    self.data =
        (
            self.data &
            BORROWING_MASK
        ) |
        (
            uint256(enabled ? 1 : 0)
            << BORROWING_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET BORROWING ENABLED
 * ---------------------------------------------------
 */

function getBorrowingEnabled(
    Map memory self
)
    internal
    pure
    returns (bool)
{
    return
        (
            self.data >>
            BORROWING_START_BIT_POSITION
        ) & 1 != 0;
}

/**
 * ---------------------------------------------------
 * SET PAUSED
 * ---------------------------------------------------
 */

function setPaused(
    Map storage self,
    bool paused
) internal {

    self.data =
        (
            self.data &
            PAUSED_MASK
        ) |
        (
            uint256(paused ? 1 : 0)
            << PAUSED_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET PAUSED
 * ---------------------------------------------------
 */

function getPaused(
    Map memory self
)
    internal
    pure
    returns (bool)
{
    return
        (
            self.data >>
            PAUSED_START_BIT_POSITION
        ) & 1 != 0;
}

/**
 * ---------------------------------------------------
 * SET RESERVE FACTOR
 * ---------------------------------------------------
 */

function setReserveFactor(
    Map storage self,
    uint256 reserveFactor
) internal {

    self.data =
        (
            self.data &
            RESERVE_FACTOR_MASK
        ) |
        (
            reserveFactor <<
            RESERVE_FACTOR_START_BIT_POSITION
        );
}

/**
 * ---------------------------------------------------
 * GET RESERVE FACTOR
 * ---------------------------------------------------
 */

function getReserveFactor(
    Map memory self
)
    internal
    pure
    returns (uint256)
{
    return
        (
            self.data >>
            RESERVE_FACTOR_START_BIT_POSITION
        ) & 0xFFFF;
}

}
