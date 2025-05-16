// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/WorldRecord.sol";
import "../src/AIOracle.sol";

contract AIOracleTest is Test {
    WorldRecord public worldRecord;
    AIOracle public aiOracle;

    address public ai = address(this);
    address public user = address(0x123);

    function setUp() public {
        aiOracle = new AIOracle(address(1));
        worldRecord = new WorldRecord(address(aiOracle));
        vm.startPrank(ai);
        aiOracle.setWorldRecord(address(worldRecord));
        vm.stopPrank();
    }

    function testAIOracleSubmitAnalysis() public {
        vm.startPrank(user);

        bytes32 opinionHash = worldRecord.addOpinion("We should reduce unemployment");

        bytes32[] memory opinions = new bytes32[](1);
        opinions[0] = opinionHash;

        uint256 topicId = worldRecord.createTopic("Employment Reform", "Important", "Urgent", opinions);
        vm.stopPrank();

        aiOracle.submitAnalysis(
            topicId,
            "AI suggests lowering taxes to boost employment",
            "2,000,000 billion",
            "110%",
            "50%",
            "3%",
            "10%",
            "50",
            "150"
        );

        (, , , , string memory summary) = worldRecord.topics(topicId);
        assertEq(summary, "AI suggests lowering taxes to boost employment");

        (, string memory GDP, , string memory unemployment, ,) = worldRecord.economy();
        assertEq(GDP, "2,000,000 billion");
        assertEq(unemployment, "50%");

        (, string memory protectionism, string memory liberalism) = worldRecord.culture();
        assertEq(protectionism, "50");
        assertEq(liberalism, "150");
    }
}
