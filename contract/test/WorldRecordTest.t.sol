// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/WorldRecord.sol";

contract WorldRecordTest is Test {
    WorldRecord public worldRecord;

    address public user = address(0x123);

    function setUp() public {
        worldRecord = new WorldRecord(address(0x999));
    }

    function testUserCanAddOpinionAndCreateTopic() public {
        vm.startPrank(user);

        bytes32 opinionHash = worldRecord.addOpinion("I support increasing tariffs");

        (, address sender, string memory opinionContent, ) = worldRecord.opinions(opinionHash);
        assertEq(sender, user);
        assertEq(opinionContent, "I support increasing tariffs");

        bytes32[] memory opinions = new bytes32[](1);
        opinions[0] = opinionHash;

        uint256 topicId = worldRecord.createTopic("Tariff Act Related Topic", "Critical", "Urgent", opinions);

        (uint256 id, string memory topicContent, , , ) = worldRecord.topics(topicId);
        assertEq(id, topicId);
        assertEq(topicContent, "Tariff Act Related Topic");

        vm.stopPrank();
    }
}
