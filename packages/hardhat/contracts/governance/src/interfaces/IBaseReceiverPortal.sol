// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBaseReceiverPortal {
    function receiveCrossChainMessage(
        address originSender,
        uint256 originChainId,
        bytes calldata message
    ) external;
}