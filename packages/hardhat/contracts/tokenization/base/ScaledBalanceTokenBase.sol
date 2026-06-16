// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MintableIncentivizedERC20.sol";

import "../../libraries/WadRayMath.sol";

abstract contract ScaledBalanceTokenBase is
MintableIncentivizedERC20
{
using WadRayMath
for uint256;

/**
 * ---------------------------------------------------
 * EVENTS
 * ---------------------------------------------------
 */

event Mint(
    address indexed caller,
    address indexed onBehalfOf,
    uint256 value,
    uint256 balanceIncrease,
    uint256 index
);

event Burn(
    address indexed from,
    address indexed target,
    uint256 value,
    uint256 balanceIncrease,
    uint256 index
);

/**
 * ---------------------------------------------------
 * CONSTRUCTOR
 * ---------------------------------------------------
 */

constructor(
    address pool,
    string memory name_,
    string memory symbol_
)
    MintableIncentivizedERC20(
        pool,
        name_,
        symbol_
    )
{}

/**
 * ---------------------------------------------------
 * SCALED BALANCE
 * ---------------------------------------------------
 */

function scaledBalanceOf(
    address user
)
    public
    view
    virtual
    returns (uint256)
{
    return
        super.balanceOf(
            user
        );
}

/**
 * ---------------------------------------------------
 * SCALED TOTAL SUPPLY
 * ---------------------------------------------------
 */

function scaledTotalSupply()
    public
    view
    virtual
    returns (uint256)
{
    return
        super.totalSupply();
}

/**
 * ---------------------------------------------------
 * PREVIOUS INDEX
 * ---------------------------------------------------
 */

function getPreviousIndex(
    address user
)
    external
    view
    virtual
    returns (uint256)
{
    return
        _userState[user]
            .additionalData;
}

/**
 * ---------------------------------------------------
 * MINT SCALED
 * ---------------------------------------------------
 */

function _mintScaled(
    address caller,
    address onBehalfOf,
    uint256 amount,
    uint256 index
)
    internal
    returns (bool)
{
    uint256 amountScaled =
        amount.rayDiv(
            index
        );

    require(
        amountScaled != 0,
        "INVALID_MINT_AMOUNT"
    );

    uint256 scaledBalance =
        super.balanceOf(
            onBehalfOf
        );

    uint256 previousBalance =
        scaledBalance.rayMul(
            uint256(
                _userState[
                    onBehalfOf
                ].additionalData
            )
        );

    uint256 balanceIncrease =
        scaledBalance.rayMul(
            index
        ) -
        previousBalance;

    _userState[
        onBehalfOf
    ].additionalData =
        uint128(index);

    _mint(
        onBehalfOf,
        amountScaled
    );

    emit Mint(
        caller,
        onBehalfOf,
        amount,
        balanceIncrease,
        index
    );

    return
        scaledBalance == 0;
}

/**
 * ---------------------------------------------------
 * BURN SCALED
 * ---------------------------------------------------
 */

function _burnScaled(
    address user,
    address target,
    uint256 amount,
    uint256 index
) internal {

    uint256 amountScaled =
        amount.rayDiv(
            index
        );

    require(
        amountScaled != 0,
        "INVALID_BURN_AMOUNT"
    );

    uint256 scaledBalance =
        super.balanceOf(
            user
        );

    uint256 previousBalance =
        scaledBalance.rayMul(
            uint256(
                _userState[user]
                    .additionalData
            )
        );

    uint256 balanceIncrease =
        scaledBalance.rayMul(
            index
        ) -
        previousBalance;

    _userState[user]
        .additionalData =
            uint128(index);

    _burn(
        user,
        amountScaled
    );

    emit Burn(
        user,
        target,
        amount,
        balanceIncrease,
        index
    );
}

}
