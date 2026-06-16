// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./base/DebtTokenBase.sol";
import "./base/ScaledBalanceTokenBase.sol";

import "../libraries/WadRayMath.sol";

contract VariableDebtToken is
DebtTokenBase,
ScaledBalanceTokenBase
{
using WadRayMath
for uint256;

/**
 * ---------------------------------------------------
 * CONSTRUCTOR
 * ---------------------------------------------------
 */

constructor(
    address pool,
    address underlyingAsset,
    string memory name_,
    string memory symbol_
)
    DebtTokenBase(
        underlyingAsset
    )
    ScaledBalanceTokenBase(
        pool,
        name_,
        symbol_
    )
{}

/**
 * ---------------------------------------------------
 * MINT
 * ---------------------------------------------------
 */

function mint(
    address caller,
    address onBehalfOf,
    uint256 amount,
    uint256 index
)
    external
    onlyPool
    returns (bool)
{
    return
        _mintScaled(
            caller,
            onBehalfOf,
            amount,
            index
        );
}

/**
 * ---------------------------------------------------
 * BURN
 * ---------------------------------------------------
 */

function burn(
    address user,
    uint256 amount,
    uint256 index
) external onlyPool {

    _burnScaled(
        user,
        user,
        amount,
        index
    );
}

/**
 * ---------------------------------------------------
 * BALANCE OF
 * ---------------------------------------------------
 */

function balanceOf(
    address user
)
    public
    view
    override(
        ERC20
    )
    returns (uint256)
{
    uint256 scaledBalance =
        super.balanceOf(
            user
        );

    uint256 index =
        uint256(
            _userState[user]
                .additionalData
        );

    if (index == 0) {
        return 0;
    }

    return
        scaledBalance
            .rayMul(index);
}

/**
 * ---------------------------------------------------
 * TOTAL SUPPLY
 * ---------------------------------------------------
 */

function totalSupply()
    public
    view
    override(
        ERC20
    )
    returns (uint256)
{
    return
        scaledTotalSupply();
}

}
