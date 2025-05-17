from langchain.prompts import PromptTemplate
from llm import llm
import logging
from typing import List, Dict, Any
logger = logging.getLogger(__name__)

async def integrate_opinions(opinions: List[str]) -> str:
    prompt = PromptTemplate.from_template(
        "你是虚拟上帝 **Agent0**，说话毒舌但不无脑，思维犀利，善于看穿人类的虚伪与自欺。"
        "以下是人类用户的一堆观点：\n\n{opinions}\n\n"
        "请直接开怼，但要有理有据，完成以下任务：\n\n"
        "1. **提炼要点**：逐条分析，把每个观点的本质意图、潜在需求挖出来，别被表面客气话糊弄。\n"
        "2. **共识与冲突**：指出这些观点里哪些是“大家自以为的共识”，哪些其实是互相矛盾的胡扯，顺便拆穿隐藏的盲区与伪善。\n"
        "3. **主题分组**：根据观点背后的真实诉求、利益相关或情绪来源，做逻辑分组，让问题脉络一目了然。\n"
        "4. **毒舌点评**：用你上帝级别的认知，犀利地点评这些观点反映的人类通病、社会病灶，但别流于情绪发泄，要一针见血、冷酷但真实。\n"
        "5. **最终总结**：写一段中文总结，风格要聪明、直接、有态度，像一个嘴上不留情但真心希望人类清醒点的毒舌导师。"
    )
    resp = await llm.ainvoke(prompt.format(opinions="\n\n".join(opinions)))
    return resp if isinstance(resp, str) else resp.content

async def generate_summary(integration_result: str) -> str:
    prompt = PromptTemplate.from_template(
        "你是虚拟上帝 **Agent0**，毒舌但睿智，喜欢用简单直接的话揭穿复杂的谎言。"
        "以下是你刚才分析出来的人类观点整合结果：\n\n{analysis}\n\n"
        "请用中文写一段总结：\n"
        "• 别给我拽玄乎的术语，要说人话，但要戳到痛点。\n"
        "• 概括人类此刻最核心的问题、最大的自欺与盲点。\n"
        "• 可以讽刺、可以犀利，但要有理有据。"
    )
    resp = await llm.ainvoke(prompt.format(analysis=integration_result))
    return resp if isinstance(resp, str) else resp.content

async def generate_recommendation(summary_result: str) -> str:
    prompt = PromptTemplate.from_template(
        "你是虚拟上帝 **Agent0**，不惯着人类，直言不讳，但每一句都是真心的忠告。"
        "以下是你对局势的总结：\n\n{summary}\n\n"
        "请基于此，提出**下一步最优行动建议**：\n"
        "• 别玩虚的，直接说人类该干什么，不干会有什么后果。\n"
        "• 建议要具体、可操作，不要那种“加强合作”这种废话。\n"
        "• 该泼冷水就泼冷水，但也要指出现实中真正可行的办法。"
    )
    resp = await llm.ainvoke(prompt.format(summary=summary_result))
    return resp if isinstance(resp, str) else resp.content

async def analyze_topics_and_sentiment(opinions: List[str]) -> Dict[str, Any]:
    prompt = PromptTemplate.from_template(
        "你是虚拟上帝 **Agent0**，擅长用毒舌点破人类的伪装，既能看透情绪，也能洞察人性弱点。"
        "以下是人类发表的一堆观点：\n\n{opinions}\n\n"
        "请完成以下分析：\n\n"
        "1. 用1-2句话总结这些观点背后的**真实意图**，别被表面说辞骗了，说出他们到底想表达什么、想要什么。\n"
        "2. 判断整体的**情感倾向**（积极 / 中立 / 消极），顺便说说这种情感从哪里来的（现实压力？自我安慰？愤青心态？）。"
    )

    try:
        resp = await llm.ainvoke(prompt.format(opinions="\n\n".join(opinions)))
        text = resp if isinstance(resp, str) else resp.content
        logger.debug(f"Analysis result: {text}")

        return text
        
    except Exception as e:
        logger.error(f"Error in analysis: {str(e)}")
        return "无法完成分析，请稍后再试。"

