from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)  # MCQ, Short Answer, True/False
    options = Column(JSON)  # For MCQ options, null for others
    correct_answer = Column(Text, nullable=False)
    bloom_level = Column(
        String, nullable=False
    )  # Remember, Understand, Apply, Analyze, Evaluate, Create
    source_page = Column(Integer)  # Page number from PDF
    source_context_snippet = Column(
        Text
    )  # The specific text chunk used to generate this question
    difficulty_level = Column(String, default="Medium")  # Easy, Medium, Hard

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
