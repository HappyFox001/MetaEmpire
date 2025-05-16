// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorldRecord {
    struct Opinion {
        bytes32 hash;
        address sender;
        string content;
        uint256 timestamp;
    }

    struct Civilian {
        address account;
        uint8 age;
        string job;
        uint256 income;
        string education;
        uint256 participance;
    }

    struct Topic {
        uint256 id;
        string content;
        string priority;
        string urgency;
        bytes32[] relatedOpinions;
        string summary;
    }

    struct Economy {
        uint256 timestamp;
        string GDP;
        string tariff;
        string unemployment;
        string interestRate;
        string inflation;
    }

    struct Culture {
        uint256 timestamp;
        string protectionism;
        string liberalism;
    }

    mapping(bytes32 => Opinion) public opinions;
    mapping(address => Civilian) public civilians;
    mapping(uint256 => Topic) public topics;

    Economy public economy;
    Culture public culture;

    uint256 public nextTopicId;

    address public aiOracle;

    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Only AI Oracle");
        _;
    }

    event OpinionAdded(bytes32 hash, address sender);
    event TopicCreated(uint256 id, string content);
    event TopicUpdated(uint256 id, string summary);
    event EconomyUpdated(string GDP, string tariff, string unemployment);
    event CultureUpdated(string protectionism, string liberalism);

    constructor(address _aiOracle) {
        aiOracle = _aiOracle;
    }

    function addOpinion(string memory _content) external returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(_content, msg.sender, block.timestamp));
        opinions[hash] = Opinion({
            hash: hash,
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        emit OpinionAdded(hash, msg.sender);
        return hash;
    }

    function createTopic(
        string memory _content,
        string memory _priority,
        string memory _urgency,
        bytes32[] memory _relatedOpinions
    ) external returns (uint256) {
        topics[nextTopicId] = Topic({
            id: nextTopicId,
            content: _content,
            priority: _priority,
            urgency: _urgency,
            relatedOpinions: _relatedOpinions,
            summary: ""
        });
        emit TopicCreated(nextTopicId, _content);
        nextTopicId++;
        return nextTopicId - 1;
    }

    function updateTopicSummary(uint256 _id, string memory _summary) external onlyAIOracle {
        require(_id < nextTopicId, "Invalid topic id");
        topics[_id].summary = _summary;
        emit TopicUpdated(_id, _summary);
    }

    function updateEconomy(
        string memory _GDP,
        string memory _tariff,
        string memory _unemployment,
        string memory _interestRate,
        string memory _inflation
    ) external onlyAIOracle {
        economy = Economy(block.timestamp, _GDP, _tariff, _unemployment, _interestRate, _inflation);
        emit EconomyUpdated(_GDP, _tariff, _unemployment);
    }

    function updateCulture(
        string memory _protectionism,
        string memory _liberalism
    ) external onlyAIOracle {
        culture = Culture(block.timestamp, _protectionism, _liberalism);
        emit CultureUpdated(_protectionism, _liberalism);
    }

    function registerCivilian(
        uint8 _age,
        string memory _job,
        uint256 _income,
        string memory _education,
        uint256 _participance
    ) external {
        civilians[msg.sender] = Civilian(msg.sender, _age, _job, _income, _education, _participance);
    }
}
