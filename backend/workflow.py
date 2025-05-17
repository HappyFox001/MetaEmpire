import uuid
import time
import logging
from typing import Dict, List, Optional
from analysis import integrate_opinions, analyze_topics_and_sentiment, generate_summary, generate_recommendation
import asyncio
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STEPS = [
    {
        "id": "waiting",
        "title": "等待发送",
        "description": "您的观点正在准备上链",
        "icon": "clock"
    },
    {
        "id": "blockchain",
        "title": "区块链处理",
        "description": "将您的观点安全记录到区块链",
        "icon": "arrow"
    },
    {
        "id": "ai_fetching",
        "title": "AI数据收集",
        "description": "人工智能正在收集相关观点数据",
        "icon": "brain"
    },
    {
        "id": "ai_analyzing",
        "title": "AI分析中",
        "description": "分析观点数据中的模式和关联",
        "icon": "chart",
        "details": "正在进行观点聚类分析..."
    },
    {
        "id": "ai_summarizing",
        "title": "生成摘要",
        "description": "根据分析结果生成综合摘要",
        "icon": "file"
    },
    {
        "id": "ai_recommendation",
        "title": "提出建议",
        "description": "基于分析提出行动建议",
        "icon": "message"
    },
    {
        "id": "complete",
        "title": "处理完成",
        "description": "您的观点已被记录并分析",
        "icon": "check"
    }
]

class StatusUpdate(BaseModel):
    step_id: str
    status: str
    details: Optional[str] = None
    timestamp: float = time.time()
    progress: Optional[int] = None

class WorkflowTask(BaseModel):
    task_id: str
    topic_id: int
    content: Optional[str] = None
    action: str = "full"
    current_step: str = "waiting"
    status: str = "pending"
    history: List[Dict] = []
    result: Optional[Dict] = None
    created_at: float = time.time()
    updated_at: float = time.time()
    error: Optional[str] = None

tasks: Dict[str, WorkflowTask] = {}

class WorkflowManager:
    @staticmethod
    def create_task(topic_id: int, content: str = None, action: str = "full") -> str:
        task_id = str(uuid.uuid4())
        task = WorkflowTask(
            task_id=task_id,
            topic_id=topic_id,
            content=content,
            action=action
        )
        
        task.history.append({
            "step_id": "waiting",
            "status": "pending",
            "timestamp": time.time()
        })
        
        tasks[task_id] = task
        logger.info(f"Created new task: {task_id} for topic: {topic_id}")
        
        asyncio.create_task(WorkflowManager.process_task(task_id,content))
        
        return task_id
    
    @staticmethod
    def get_task(task_id: str) -> Optional[WorkflowTask]:
        return tasks.get(task_id)
    
    @staticmethod
    def update_task_status(task_id: str, update: StatusUpdate) -> bool:
        task = tasks.get(task_id)
        if not task:
            return False
        
        task.current_step = update.step_id
        task.status = update.status
        task.updated_at = update.timestamp
        
        task.history.append({
            "step_id": update.step_id,
            "status": update.status,
            "details": update.details,
            "timestamp": update.timestamp,
            "progress": update.progress
        })
        
        if update.status == "error" and update.details:
            task.error = update.details
        
        logger.info(f"Updated task {task_id} status: {update.step_id} -> {update.status}")
        return True
    
    @staticmethod
    async def process_task(task_id: str,content: str):
        task = tasks.get(task_id)
        if not task:
            logger.error(f"Task {task_id} not found")
            return
        
        try:
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_fetching",
                "processing",
                "正在收集相关观点数据...",
                1
            )
            from api import world_record_contract
            try:
                print("Getting opinion count...")
                opinion_count = world_record_contract.get_opinion_count()
                print(f"Opinion count: {opinion_count}")
                
                if opinion_count > 0:
                    all_opinions = world_record_contract.getAllOpinions()
                    opinion_contents = [opinion[2] for opinion in all_opinions]  # 获取 content 字段
                else:
                    opinion_contents = [content]
                    print("No opinions found, using input content:", opinion_contents[0])
                print("Finished fetching opinions")
            except Exception as e:
                logger.error(f"Error in opinion processing: {str(e)}")
                opinion_contents = [content]
            
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_fetching",
                "complete",
                f"已收集到 {len(opinion_contents)} 条相关观点",
                1
            )
            
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_analyzing",
                "processing",
                "正在进行观点聚类分析...",
                1
            )

            integration_result = await integrate_opinions(opinion_contents)
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_analyzing",
                "processing",
                integration_result,
                1
            )

            analysis_result = await analyze_topics_and_sentiment(opinion_contents)
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_analyzing",
                "complete",
                analysis_result,
                1
            )

            await WorkflowManager._update_with_delay(
                task_id,
                "ai_summarizing",
                "processing",
                "正在生成总结和建议...",
                1
            )
            
            summary = await generate_summary(integration_result)     
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_summarizing",
                "complete",
                summary,
                0.5
            )
            
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_recommendation",
                "processing",
                "正在基于分析结果生成建议...",
                1
            )

            recommendations = await generate_recommendation(integration_result)
            await WorkflowManager._update_with_delay(
                task_id,
                "ai_recommendation",
                "complete",
                recommendations,
                0.5
            )

            completion_message = "完成分析"
            
            await WorkflowManager._update_with_delay(
                task_id, 
                "complete", 
                "complete", 
                completion_message,
                0.5
            )

            task.result = {
                "summary": summary,
                "recommendations": recommendations,
                "total_opinions": len(opinion_contents)
            }

            if task.topic_id is not None:
                try:
                    world_record_contract.contract.functions.updateTopicSummary(
                        task.topic_id,
                        summary
                    ).transact()
                except Exception as e:
                    logger.warning(f"Failed to update topic summary: {str(e)}")
            
            logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error processing task {task_id}: {str(e)}")
            WorkflowManager.update_task_status(
                task_id, 
                StatusUpdate(
                    step_id=task.current_step or "error",
                    status="error",
                    details=f"处理过程中发生错误: {str(e)}"
                )
            )
    
    @staticmethod
    async def _update_with_delay(task_id: str, step_id: str, status: str, details: str, delay: float):
        WorkflowManager.update_task_status(
            task_id,
            StatusUpdate(
                step_id=step_id,
                status=status,
                details=details
            )
        )
        await asyncio.sleep(delay)
    
    @staticmethod
    def get_current_status(task_id: str) -> Dict:
        task = tasks.get(task_id)
        if not task:
            return {
                "error": "Task not found",
                "status_code": 404
            }
        
        latest_history = task.history[-1] if task.history else {}
        
        return {
            "task_id": task.task_id,
            "topic_id": task.topic_id,
            "step_id": task.current_step,
            "status": task.status,
            "details": latest_history.get("details"),
            "timestamp": latest_history.get("timestamp"),
            "progress": latest_history.get("progress"),
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "action": task.action,
            "result": task.result if task.status == "complete" and task.current_step == "complete" else None
        }
    
    @staticmethod
    def get_all_steps(with_status: bool = False, task_id: Optional[str] = None) -> List[Dict]:
        if not with_status or not task_id:
            return STEPS
        
        task = tasks.get(task_id)
        if not task:
            return STEPS
        
        steps_with_status = []
        for step in STEPS:
            step_status = "pending"
            step_details = None
            
            for history in reversed(task.history):
                if history["step_id"] == step["id"]:
                    step_status = history["status"]
                    step_details = history.get("details")
                    break
            
            step_with_status = step.copy()
            step_with_status["status"] = step_status
            if step_details:
                step_with_status["details"] = step_details
            
            steps_with_status.append(step_with_status)
        
        return steps_with_status
