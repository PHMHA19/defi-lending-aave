// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {ICrossChainController} from '../interfaces/ICrossChainController.sol';
import {IVotingPortal} from '../interfaces/IVotingPortal.sol';
import {IBaseReceiverPortal} from '../interfaces/IBaseReceiverPortal.sol';
import {IVotingMachineWithProofs} from './voting/interfaces/IVotingMachineWithProofs.sol';
import {Ownable} from '../../../dependencies/openzeppelin/contracts/Ownable.sol';

contract VotingPortal is IVotingPortal, Ownable {
  address public immutable CROSS_CHAIN_CONTROLLER;
  address public immutable GOVERNANCE;
  address public immutable VOTING_MACHINE;
  uint256 public immutable VOTING_MACHINE_CHAIN_ID;

  constructor(
    address crossChainController,
    address governance,
    address votingMachine,
    uint256 votingMachineChainId,
    address owner
  ) Ownable() {
    require(crossChainController != address(0), 'INVALID_CROSS_CHAIN_CONTROLLER');
    require(governance != address(0), 'INVALID_GOVERNANCE');
    require(votingMachine != address(0), 'INVALID_VOTING_MACHINE');
    require(votingMachineChainId > 0, 'INVALID_CHAIN_ID');
    require(owner != address(0), 'INVALID_OWNER');

    CROSS_CHAIN_CONTROLLER = crossChainController;
    GOVERNANCE = governance;
    VOTING_MACHINE = votingMachine;
    VOTING_MACHINE_CHAIN_ID = votingMachineChainId;

    _transferOwnership(owner);
  }

  function receiveCrossChainMessage(
    address originSender,
    uint256 originChainId,
    bytes calldata message
  ) external {
    require(msg.sender == CROSS_CHAIN_CONTROLLER, 'WRONG_CONTROLLER');
    require(originSender == VOTING_MACHINE, 'WRONG_ORIGIN');
    require(originChainId == VOTING_MACHINE_CHAIN_ID, 'WRONG_CHAIN');

    (uint256 proposalId, uint256 forVotes, uint256 againstVotes) = abi.decode(
      message,
      (uint256, uint256, uint256)
    );

    // The governance contract is expected to process the result back.
    (bool success, ) = GOVERNANCE.call(
      abi.encodeWithSignature(
        'queueProposal(uint256,uint128,uint128)',
        proposalId,
        uint128(forVotes),
        uint128(againstVotes)
      )
    );
    require(success, 'QUEUE_PROPOSAL_FAILED');
  }

  function forwardStartVotingMessage(
    uint256 proposalId,
    bytes32 blockHash,
    uint24 votingDuration
  ) external override {
    require(msg.sender == GOVERNANCE, 'ONLY_GOVERNANCE');

    bytes memory message = abi.encode(
      IVotingPortal.MessageType.Proposal,
      abi.encode(proposalId, blockHash, votingDuration)
    );

    ICrossChainController(CROSS_CHAIN_CONTROLLER).forwardMessage(
      VOTING_MACHINE_CHAIN_ID,
      VOTING_MACHINE,
      0,
      message
    );
  }

  function forwardVoteMessage(
    uint256 proposalId,
    address voter,
    bool support,
    bytes calldata votingProofs
  ) external override {
    require(msg.sender == GOVERNANCE, 'ONLY_GOVERNANCE');

    bytes memory message = abi.encode(
      IVotingPortal.MessageType.Vote,
      abi.encode(proposalId, voter, support, votingProofs)
    );

    ICrossChainController(CROSS_CHAIN_CONTROLLER).forwardMessage(
      VOTING_MACHINE_CHAIN_ID,
      VOTING_MACHINE,
      0,
      message
    );
  }

  function decodeMessage(
    bytes calldata message
  ) external pure returns (IVotingPortal.MessageType, bytes memory) {
    return abi.decode(message, (IVotingPortal.MessageType, bytes));
  }

  function _sendMessage(
    bytes memory message
  ) internal {
    ICrossChainController(CROSS_CHAIN_CONTROLLER).forwardMessage(
      VOTING_MACHINE_CHAIN_ID,
      VOTING_MACHINE,
      0,
      message
    );
  }
}