from langchain.prompts import PromptTemplate
from llm import llm
import logging, json
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

async def integrate_opinions(opinions: List[str]) -> str:
    prompt = PromptTemplate.from_template(
        "以下是用户发表的观点列表：\n\n{opinions}\n\n"
        "请分步骤说明你的思考过程，并输出：\n"
        "• 各观点的关键要点\n"
        "• 主要共识与分歧\n"
        "• 将观点按主题进行有逻辑的分组\n"
        "最后给出完整的中文总结。"
    )
    resp = await llm.ainvoke(prompt.format(opinions="\n\n".join(opinions)))
    return resp if isinstance(resp, str) else resp.content

async def generate_summary_and_recommendation(integration_result: str) -> str:
    prompt = PromptTemplate.from_template(
        "下面是整合后的观点分析结果：\n\n{analysis}\n\n"
        "请根据该分析，用中文撰写：\n"
        "1. 总结（概括核心结论，字数不限）\n"
        "2. 下一步最优行动建议（给出具体且可执行的建议）"
    )
    resp = await llm.ainvoke(prompt.format(analysis=integration_result))
    return resp if isinstance(resp, str) else resp.content

from langchain.prompts import PromptTemplate
from llm import llm
import json, logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def analyze_topics_and_sentiment(opinions: List[str]) -> Dict[str, Any]:
    prompt = PromptTemplate.from_template(
        "以下是用户观点：\n\n{opinions}\n\n"
        "请完成以下任务，答案必须是 **有效 JSON**，字段名为英文：\n"
        "1. **自动抽取主题**：自行归纳每条观点所属的主题关键词（无需预设列表，可多选）。\n"
        "2. **情感分析**：判定每条观点的情感极性（positive / negative / neutral）。\n"
        "3. **主题分布**：计算各主题出现的百分比（总和=100）。\n"
        "4. **主主题**：指出出现最多的主题。\n\n"
        "输出示例：\n"
        "{{\n"
        "  'sentiment_analysis': {{'positive': 40, 'negative': 20, 'neutral': 40}},\n"
        "  'topic_distribution': {{'AI': 35, 'Web3': 25, 'Economy': 40}},\n"
        "  'main_topic': 'Economy'\n"
        "}}\n"
        "仅返回 JSON，不要额外说明。"
    )

    try:
        resp = await llm.ainvoke(prompt.format(opinions="\n\n".join(opinions)))
        text = resp if isinstance(resp, str) else resp.content
        return json.loads(text.replace("'", '"'))
    except Exception as e:
        logger.error(f"Error parsing analysis result: {str(e)}")
        return {
            "sentiment_analysis": {"positive": 33, "negative": 33, "neutral": 34},
            "topic_distribution": {},
            "main_topic": "Uncategorized"
        }
