// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./base/DebtTokenBase.sol";
import "./base/ScaledBalanceTokenBase.sol";

import "../libraries/WadRayMath.sol";
import "../libraries/MathUtils.sol";

contract StableDebtToken is
DebtTokenBase,
ScaledBalanceTokenBase
{
using WadRayMath
for uint256;

/**
 * ---------------------------------------------------
 * USER STABLE RATE
 * ---------------------------------------------------
 */

mapping(address => uint256)
    internal _userStableRate;

/**
 * ---------------------------------------------------
 * USER TIMESTAMPS
 * ---------------------------------------------------
 */
mapping(address => uint40)
    internal _timestamps;

/**
 * ---------------------------------------------------
 * AVG STABLE RATE
 * ---------------------------------------------------
 */

uint256 internal
    _avgStableRate;

/**
 * ---------------------------------------------------
 * TOTAL SUPPLY TIMESTAMP
 * ---------------------------------------------------
 */

uint40 internal
    _totalSupplyTimestamp;

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
{
    _totalSupplyTimestamp =
        uint40(
            block.timestamp
        );
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
    uint256 rate
)
    external
    onlyPool
    returns (bool)
{
    uint256 previousSupply =
        totalSupply();

    uint256 previousUserDebt =
        balanceOf(
            onBehalfOf
        );

    bool firstBorrow =
        _mintScaled(
            caller,
            onBehalfOf,
            amount,
            WadRayMath.RAY
        );

    uint256 nextUserDebt =
        previousUserDebt +
        amount;

    _userStableRate[
        onBehalfOf
    ] =
        (
            (
                previousUserDebt *
                _userStableRate[
                    onBehalfOf
                ]
            ) +
            (
                amount *
                rate
            )
        ) /
        nextUserDebt;

    _timestamps[
        onBehalfOf
    ] =
        uint40(
            block.timestamp
        );

    uint256 nextSupply =
        previousSupply +
        amount;

    if (nextSupply != 0) {

        _avgStableRate =
            (
                (
                    _avgStableRate *
                    previousSupply
                ) +
                (
                    rate *
                    amount
                )
            ) /
            nextSupply;
    }

    _totalSupplyTimestamp =
        uint40(
            block.timestamp
        );

    return firstBorrow;
}

/**
 * ---------------------------------------------------
 * BURN
 * ---------------------------------------------------
 */

function burn(
    address user,
    uint256 amount
) external onlyPool {

    _burnScaled(
        user,
        user,
        amount,
        WadRayMath.RAY
    );

    if (
        scaledBalanceOf(
            user
        ) == 0
    ) {

        _userStableRate[
            user
        ] = 0;
    }

    _timestamps[user] =
        uint40(
            block.timestamp
        );

    _totalSupplyTimestamp =
        uint40(
            block.timestamp
        );
}

/**
 * ---------------------------------------------------
 * PRINCIPAL BALANCE
 * ---------------------------------------------------
 */

function principalBalanceOf(
    address user
)
    public
    view
    returns (uint256)
{
    return
        super.balanceOf(
            user
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
    uint256 principalBalance =
        principalBalanceOf(
            user
        );

    if (
        principalBalance == 0
    ) {
        return 0;
    }

    uint256 cumulatedInterest =
        MathUtils
            .calculateCompoundedInterest(
                _userStableRate[
                    user
                ],
                _timestamps[
                    user
                ]
            );

    return
        principalBalance
            .rayMul(
                cumulatedInterest
            );
}

/**
 * ---------------------------------------------------
 * USER STABLE RATE
 * ---------------------------------------------------
 */

function getUserStableRate(
    address user
)
    external
    view
    returns (uint256)
{
    return
        _userStableRate[user];
}

/**
 * ---------------------------------------------------
 * AVG STABLE RATE
 * ---------------------------------------------------
 */

function getAverageStableRate()
    external
    view
    returns (uint256)
{
    return
        _avgStableRate;
}

/**
 * ---------------------------------------------------
 * SUPPLY DATA
 * ---------------------------------------------------
 */

function getSupplyData()
    external
    view
    returns (
        uint256,
        uint256,
        uint40
    )
{
    return (
        principalBalanceOf(
            address(this)
        ),
        _avgStableRate,
        _totalSupplyTimestamp
    );
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
    uint256 principalSupply =
        scaledTotalSupply();

    if (
        principalSupply == 0
    ) {
        return 0;
    }

    uint256 cumulatedInterest =
        MathUtils
            .calculateCompoundedInterest(
                _avgStableRate,
                _totalSupplyTimestamp
            );

    return
        principalSupply
            .rayMul(
                cumulatedInterest
            );
}

}
