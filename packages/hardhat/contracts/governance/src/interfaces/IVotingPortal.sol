// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVotingPortal {
    function forwardStartVotingMessage(
        uint256 proposalId,
        bytes32 blockHash,
        uint24 votingDuration
    ) external;
}