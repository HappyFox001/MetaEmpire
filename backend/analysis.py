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
        "请分析以下用户观点，并直接返回主要意图和情感倾向：\n\n"
        "观点：\n{opinions}\n\n"
        "请用1-2句话总结主要意图，并判断整体情感倾向（积极/中立/消极）"
    )

    try:
        resp = await llm.ainvoke(prompt.format(opinions="\n\n".join(opinions)))
        text = resp if isinstance(resp, str) else resp.content
        logger.debug(f"Analysis result: {text}")

        return text
        
    except Exception as e:
        logger.error(f"Error in analysis: {str(e)}")
        return "无法完成分析，请稍后再试。"