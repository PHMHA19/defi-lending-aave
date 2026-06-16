// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract MintableIncentivizedERC20 is ERC20 {

/**
 * ---------------------------------------------------
 * USER STATE
 * ---------------------------------------------------
 */

struct UserState {

    uint128 balance;

    uint128 additionalData;
}

/**
 * ---------------------------------------------------
 * USER STATES
 * ---------------------------------------------------
 */

mapping(address => UserState)
    internal _userState;

/**
 * ---------------------------------------------------
 * POOL
 * ---------------------------------------------------
 */

address internal immutable POOL;

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
    ERC20(
        name_,
        symbol_
    )
{
    POOL = pool;
}

/**
 * ---------------------------------------------------
 * ONLY POOL
 * ---------------------------------------------------
 */

modifier onlyPool() {

    require(
        msg.sender == POOL,
        "ONLY_POOL"
    );

    _;
}

/**
 * ---------------------------------------------------
 * GET POOL
 * ---------------------------------------------------
 */

function getPool()
    external
    view
    returns (address)
{
    return POOL;
}

}
