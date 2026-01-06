from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .question import Question

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None

class QuizCreate(QuizBase):
    pass

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    score: Optional[float] = None

class Quiz(QuizBase):
    id: int
    score: Optional[float]
    total_questions: int
    user_id: int
    created_at: datetime
    questions: List[Question] = []
    
    class Config:
        from_attributes = True

class QuizSummary(BaseModel):
    id: int
    title: str
    description: Optional[str]
    score: Optional[float]
    total_questions: int
    created_at: datetime
    
    class Config:
        from_attributes = True