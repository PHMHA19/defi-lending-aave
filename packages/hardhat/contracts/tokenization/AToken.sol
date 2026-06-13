// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./base/ScaledBalanceTokenBase.sol";

import "../libraries/WadRayMath.sol";

contract AToken is
ScaledBalanceTokenBase
{
using WadRayMath
for uint256;

/**
 * ---------------------------------------------------
 * UNDERLYING ASSET
 * ---------------------------------------------------
 */

address internal
    _underlyingAsset;

/**
 * ---------------------------------------------------
 * EVENTS
 * ---------------------------------------------------
 */


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
    ScaledBalanceTokenBase(
        pool,
        name_,
        symbol_
    )
{
    _underlyingAsset =
        underlyingAsset;
}

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
    address from,
    address receiverOfUnderlying,
    uint256 amount,
    uint256 index
) external onlyPool {

    _burnScaled(
        from,
        receiverOfUnderlying,
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

/**
 * ---------------------------------------------------
 * UNDERLYING ASSET
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

}
