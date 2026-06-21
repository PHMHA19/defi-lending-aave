// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRescuableBase {
    function maxRescue(address token)
        external
        view
        returns (uint256);
}

interface IRescuable is IRescuableBase {
    function whoCanRescue()
        external
        view
        returns (address);
}

abstract contract RescuableBase is IRescuableBase {}

abstract contract Rescuable is IRescuable {
    function whoCanRescue()
        public
        view
        virtual
        returns (address);

    function maxRescue(address token)
        public
        view
        virtual
        returns (uint256);
}