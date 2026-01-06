from pydantic import BaseModel, validator
from typing import List, Optional, Any

class QuestionBase(BaseModel):
    question_text: str
    question_type: str  # MCQ, Short Answer, True/False
    correct_answer: str
    bloom_level: str
    difficulty_level: str = "Medium"

class QuestionCreate(QuestionBase):
    options: Optional[List[str]] = None
    source_page: Optional[int] = None
    source_context_snippet: Optional[str] = None

class Question(QuestionBase):
    id: int
    quiz_id: int
    options: Optional[List[str]] = None
    source_page: Optional[int] = None
    source_context_snippet: Optional[str] = None
    
    class Config:
        from_attributes = True

class QuestionAnswer(BaseModel):
    question_id: int
    user_answer: str

class QuizSubmission(BaseModel):
    answers: List[QuestionAnswer]

class QuestionGenConfig(BaseModel):
    mcq_count: int = 5
    short_answer_count: int = 3
    true_false_count: int = 2
    difficulty_distribution: dict = {"Easy": 30, "Medium": 50, "Hard": 20}
    bloom_levels: List[str] = ["Remember", "Understand", "Apply", "Analyze"]

class TextQuizRequest(BaseModel):
    title: str
    text_content: str
    config: QuestionGenConfig
    
    @validator('text_content')
    def validate_text_content(cls, v):
        if not v or not v.strip():
            raise ValueError('Text content cannot be empty')
        if len(v) > 10000:
            raise ValueError('Text content cannot exceed 10,000 characters')
        if len(v.strip()) < 100:
            raise ValueError('Text content must be at least 100 characters')
        return v.strip()
    
    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()