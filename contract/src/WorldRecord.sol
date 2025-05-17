// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorldRecord {
    struct Opinion {
        bytes32 hash;
        address sender;
        string  content;
        uint256 timestamp;
    }

    struct Civilian {
        address account;
        uint8   age;
        string  job;
        uint256 income;
        string  education;
        uint256 participance;
    }

    struct Topic {
        uint256   id;
        string    content;
        string    priority;
        string    urgency;
        bytes32[] relatedOpinions;
        string    summary;
    }

    struct Economy {
        uint256 timestamp;
        string  GDP;
        string  tariff;
        string  unemployment;
        string  interestRate;
        string  inflation;
    }

    struct Culture {
        uint256 timestamp;
        string  protectionism;
        string  liberalism;
    }

    mapping(bytes32 => Opinion) public opinions;
    mapping(address  => Civilian) public civilians;
    mapping(uint256  => Topic)    public topics;

    bytes32[] public allOpinionHashes;

    Economy public economy;
    Culture public culture;

    uint256 public nextTopicId;
    address public aiOracle;

    event OpinionAdded(bytes32 hash, address sender);
    event TopicCreated(uint256 id, string content);
    event TopicUpdated(uint256 id, string summary);
    event EconomyUpdated(string GDP, string tariff, string unemployment);
    event CultureUpdated(string protectionism, string liberalism);

    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Only AI Oracle");
        _;
    }
    constructor(address _aiOracle) {
        aiOracle = _aiOracle;
        

        nextTopicId = 1;
        topics[1] = Topic({
            id: 1,
            content: "Default Topic",
            priority: "medium",
            urgency: "normal",
            relatedOpinions: new bytes32[](0),
            summary: "Default topic for system operations"
        });

        string[20] memory preset = [
            unicode"特朗普提出的对华关税把全球供应链推向重新洗牌。",
            unicode"提高钢铝关税短期保护了美国制造业，却抬高了国内成本。",
            unicode"农民成了贸易战最大受害者，补贴难以弥补出口损失。",
            unicode"特朗普关税政策迫使企业加速越南和墨西哥布局。",
            unicode"对欧盟汽车加征关税的威胁让德法加强了与中国的谈判合作。",
            unicode"美元走强部分抵消了关税带来的进口价上涨。",
            unicode"关税使通胀上行压力增加，美联储政策空间被进一步挤压。",
            unicode"企业通过修改原产地规则规避部分关税，实际效果被稀释。",
            unicode"特朗普的关税是谈判筹码而非长期政策，但伤害已造成。",
            unicode"关税收入最终由消费者买单，低收入群体影响更大。",
            unicode"贸易战促使中国加快半导体自主可控进程，长远看反伤美国。",
            unicode"大豆滞销让中西部对特朗普的支持出现松动。",
            unicode"关税实施后，美国制造业 PMI 并未出现预期反弹。",
            unicode"墨加协定(USMCA)被视为替代 TPP 的政治成果。",
            unicode"特朗普通过关税施压，迫使企业将工厂搬回美国但效果有限。",
            unicode"部分企业因关税成本上升被迫裁员，失业率结构性抬头。",
            unicode"关税战为拜登政府留下谈判筹码，也留下修复盟友关系的难题。",
            unicode"贸易不确定性导致全球投资增速放缓，IMF 两度下调预期。",
            unicode"特朗普关税促使中国与东盟贸易额首超美欧。",
            unicode"长期关税壁垒可能加速世界经济集团化，削弱 WTO 规则。"
        ];

        for (uint i = 0; i < preset.length; i++) {
            bytes32 opinionHash = _addOpinionInternal(preset[i]);
            topics[1].relatedOpinions.push(opinionHash);
        }
    }

    function addOpinion(string memory _content) external returns (bytes32) {
        return _addOpinionInternal(_content);
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
        uint8   _age,
        string  memory _job,
        uint256 _income,
        string  memory _education,
        uint256 _participance
    ) external {
        civilians[msg.sender] =
            Civilian(msg.sender, _age, _job, _income, _education, _participance);
    }

    function getAllOpinions() external view returns (Opinion[] memory) {
        Opinion[] memory result = new Opinion[](allOpinionHashes.length);
        for (uint i = 0; i < allOpinionHashes.length; i++) {
            result[i] = opinions[allOpinionHashes[i]];
        }
        return result;
    }

    function getOpinionCount() external view returns (uint256) {
        return allOpinionHashes.length;
    }

    function _addOpinionInternal(string memory _content) internal returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encodePacked(_content, msg.sender, block.timestamp, allOpinionHashes.length)
        );
        opinions[hash] = Opinion({
            hash: hash,
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });
        allOpinionHashes.push(hash);
        emit OpinionAdded(hash, msg.sender);
        return hash;
    }
}
