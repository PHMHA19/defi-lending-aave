// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossChainController {
    function forwardMessage(
        uint256 destinationChainId,
        address receiver,
        uint256 gasLimit,
        bytes calldata message
    ) external payable;

    function getBridge() external view returns (address);
}