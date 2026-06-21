// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OwnableWithGuardian is Ownable {
    address internal _guardian;

    constructor() Ownable(msg.sender) {
        _guardian = msg.sender;
    }

    modifier onlyGuardian() {
        require(msg.sender == _guardian, "ONLY_GUARDIAN");
        _;
    }

    function _checkGuardian() internal view {
        require(msg.sender == _guardian, "ONLY_GUARDIAN");
    }

    function guardian() public view returns (address) {
        return _guardian;
    }

    function updateGuardian(address newGuardian) external onlyOwner {
        _updateGuardian(newGuardian);
    }

    function _updateGuardian(address newGuardian) internal {
        _guardian = newGuardian;
    }

    function _transferOwnership(
        address newOwner
    ) internal override {
        super._transferOwnership(newOwner);
    }
}