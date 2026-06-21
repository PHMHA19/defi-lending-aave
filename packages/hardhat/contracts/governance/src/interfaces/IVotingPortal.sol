// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVotingPortal {
  enum MessageType {
    Proposal,
    Vote
  }

  function forwardStartVotingMessage(
    uint256 proposalId,
    bytes32 blockHash,
    uint24 votingDuration
  ) external;

  function forwardVoteMessage(
    uint256 proposalId,
    address voter,
    bool support,
    bytes calldata votingProofs
  ) external;
}