// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../DataTypes.sol";
import "../ValidationLogic.sol";
import "../InterestLogic.sol";

import "../../tokenization/AToken.sol";

library SupplyLogic {

/**
 * ---------------------------------------------------
 * EVENTS
 * ---------------------------------------------------
 */

event Supply(
    address indexed reserve,
    address user,
    address indexed onBehalfOf,
    uint256 amount,
    uint16 indexed referralCode
);

event Withdraw(
    address indexed reserve,
    address indexed user,
    address indexed to,
    uint256 amount
);

/**
 * ---------------------------------------------------
 * EXECUTE SUPPLY
 * ---------------------------------------------------
 */

function executeSupply(
    mapping(address => DataTypes.ReserveData)
        storage reserves,
    mapping(address => address)
        storage aTokens,
    mapping(address => mapping(address => DataTypes.UserReserveData))
        storage usersReserveData,
    address asset,
    address user,
    address onBehalfOf,
    uint256 amount,
    uint16 referralCode
) internal {

    DataTypes.ReserveData
        storage reserve =
            reserves[asset];

    /**
     * ---------------------------------------------------
     * VALIDATION
     * ---------------------------------------------------
     */

    ValidationLogic
        .validateSupply(
            reserve,
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
     * UPDATE TOTAL SUPPLY
     * ---------------------------------------------------
     */

    reserve.totalSupplied +=
        amount;

    /**
     * ---------------------------------------------------
     * UPDATE USER DATA
     * ---------------------------------------------------
     */

    usersReserveData[
        onBehalfOf
    ][asset]
        .scaledSupply +=
            amount;

    /**
     * ---------------------------------------------------
     * MINT A TOKEN
     * ---------------------------------------------------
     */

    AToken(
        aTokens[asset]
    ).mint(
        user,
        onBehalfOf,
        amount,
        reserve.liquidityIndex
    );

    /**
     * ---------------------------------------------------
     * EVENTS
     * ---------------------------------------------------
     */

    emit Supply(
        asset,
        user,
        onBehalfOf,
        amount,
        referralCode
    );
}

/**
 * ---------------------------------------------------
 * EXECUTE WITHDRAW
 * ---------------------------------------------------
 */

function executeWithdraw(
    mapping(address => DataTypes.ReserveData)
        storage reserves,
    mapping(address => address)
        storage aTokens,
    mapping(address => mapping(address => DataTypes.UserReserveData))
        storage usersReserveData,
    address asset,
    address user,
    address to,
    uint256 amount
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
     * USER BALANCE
     * ---------------------------------------------------
     */

    uint256 userBalance =
        usersReserveData[
            user
        ][asset]
            .scaledSupply;

    require(
        userBalance >= amount,
        "INSUFFICIENT_BALANCE"
    );

    /**
     * ---------------------------------------------------
     * UPDATE USER DATA
     * ---------------------------------------------------
     */

    usersReserveData[
        user
    ][asset]
        .scaledSupply -=
            amount;

    /**
     * ---------------------------------------------------
     * UPDATE RESERVE
     * ---------------------------------------------------
     */

    reserve.totalSupplied -=
        amount;

    /**
     * ---------------------------------------------------
     * BURN A TOKEN
     * ---------------------------------------------------
     */

    AToken(
        aTokens[asset]
    ).burn(
        user,
        to,
        amount,
        reserve.liquidityIndex
    );

    /**
     * ---------------------------------------------------
     * EVENTS
     * ---------------------------------------------------
     */

    emit Withdraw(
        asset,
        user,
        to,
        amount
    );

    return amount;
}

}
