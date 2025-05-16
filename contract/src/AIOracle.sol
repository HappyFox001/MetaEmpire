// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WorldRecord.sol";

contract AIOracle {
    address public owner;
    WorldRecord public worldRecord;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only Owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        worldRecord = new WorldRecord(msg.sender);
    }

    function submitAnalysis(
        uint256 _topicId,
        string memory _summary,
        string memory _GDP,
        string memory _tariff,
        string memory _unemployment,
        string memory _interestRate,
        string memory _inflation,
        string memory _protectionism,
        string memory _liberalism
    ) external onlyOwner {
        worldRecord.updateTopicSummary(_topicId, _summary);
        worldRecord.updateEconomy(_GDP, _tariff, _unemployment, _interestRate, _inflation);
        worldRecord.updateCulture(_protectionism, _liberalism);
    }
}
