// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract DebtTokenBase {

/**
 * ---------------------------------------------------
 * UNDERLYING ASSET
 * ---------------------------------------------------
 */

address internal
    _underlyingAsset;

/**
 * ---------------------------------------------------
 * BORROW ALLOWANCES
 * ---------------------------------------------------
 */

mapping(
    address =>
        mapping(
            address =>
                uint256
        )
)
    internal
        _borrowAllowances;

/**
 * ---------------------------------------------------
 * EVENTS
 * ---------------------------------------------------
 */

event BorrowAllowanceDelegated(
    address indexed fromUser,
    address indexed toUser,
    uint256 amount
);

/**
 * ---------------------------------------------------
 * CONSTRUCTOR
 * ---------------------------------------------------
 */

constructor(
    address underlyingAsset
)
{
    _underlyingAsset =
        underlyingAsset;
}

/**
 * ---------------------------------------------------
 * GET UNDERLYING ASSET
 * ---------------------------------------------------
 */

function UNDERLYING_ASSET_ADDRESS()
    external
    view
    returns (address)
{
    return
        _underlyingAsset;
}

/**
 * ---------------------------------------------------
 * APPROVE DELEGATION
 * ---------------------------------------------------
 */

function approveDelegation(
    address delegatee,
    uint256 amount
) external {

    _borrowAllowances[
        msg.sender
    ][delegatee]
        = amount;

    emit
        BorrowAllowanceDelegated(
            msg.sender,
            delegatee,
            amount
        );
}

/**
 * ---------------------------------------------------
 * BORROW ALLOWANCE
 * ---------------------------------------------------
 */

function borrowAllowance(
    address fromUser,
    address toUser
)
    public
    view
    returns (uint256)
{
    return
        _borrowAllowances[
            fromUser
        ][toUser];
}

/**
 * ---------------------------------------------------
 * DECREASE BORROW ALLOWANCE
 * ---------------------------------------------------
 */

function _decreaseBorrowAllowance(
    address delegator,
    address delegatee,
    uint256 amount
) internal {

    uint256 allowance =
        _borrowAllowances[
            delegator
        ][delegatee];

    require(
        allowance >= amount,
        "BORROW_ALLOWANCE_TOO_LOW"
    );

    _borrowAllowances[
        delegator
    ][delegatee]
        =
        allowance -
        amount;
}

}
