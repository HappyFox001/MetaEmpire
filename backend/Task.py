from typing import Dict, Optional
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class Task(BaseModel):
    id: str
    status: str = "pending"
    current_step: str = None
    step_status: str = None
    message: str = None
    topic_id: Optional[int] = None
    result: Dict = None
