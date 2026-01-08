from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import tempfile
import os
import json

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.quiz import Quiz
from ..models.question import Question
from ..schemas.quiz import QuizCreate, Quiz as QuizSchema, QuizSummary, QuizUpdate
from ..schemas.question import QuestionGenConfig, QuizSubmission, TextQuizRequest
from ..services.nlp_service import NLPService
from ..services.export_service import ExportService

router = APIRouter(prefix="/quiz", tags=["quiz"])

# Initialize services
nlp_service = NLPService()
export_service = ExportService()

@router.post("/generate/from-text", response_model=QuizSchema)
async def generate_quiz_from_text(
    request: TextQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a quiz from pasted text content"""
    
    print(f"Generating quiz from text: {len(request.text_content)} characters")
    
    try:
        # Create quiz
        quiz = Quiz(
            title=request.title,
            description=f"Generated from pasted text content",
            user_id=current_user.id
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        print(f"Created quiz with ID: {quiz.id}")
        
        # Generate questions using NLP service
        config_dict = request.config.dict()
        questions_data = nlp_service.generate_questions_from_text(request.text_content, config_dict)
        
        print(f"Generated {len(questions_data)} questions from text")
        
        # Create question objects
        questions = []
        for question_data in questions_data:
            question = Question(quiz_id=quiz.id, **question_data)
            questions.append(question)
        
        # Save all questions
        if questions:
            db.add_all(questions)
        
        # Update quiz total questions
        quiz.total_questions = len(questions)
        db.commit()
        db.refresh(quiz)
        
        print(f"Text-based quiz generation completed successfully")
        return quiz
    
    except Exception as e:
        print(f"Error during text-based quiz generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz from text: {str(e)}"
        )

@router.post("/generate", response_model=QuizSchema)
async def generate_quiz(
    title: str = Form(...),
    config: str = Form(...),  # Accept as string and parse JSON
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a quiz from uploaded PDF"""
    
    # Parse config JSON
    try:
        config_dict = json.loads(config)
        question_config = QuestionGenConfig(**config_dict)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid config format: {str(e)}"
        )
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Extract text from PDF
        pages_content = nlp_service.extract_text_from_pdf(tmp_file_path)
        
        if not pages_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No text content found in PDF"
            )
        
        print(f"Extracted {len(pages_content)} pages from PDF")
        
        # Create quiz
        quiz = Quiz(
            title=title,
            description=f"Generated from {file.filename}",
            user_id=current_user.id
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        print(f"Created quiz with ID: {quiz.id}")
        
        # Generate questions
        questions = []
        
        # Generate MCQs
        print(f"Generating {question_config.mcq_count} MCQ questions...")
        for i in range(question_config.mcq_count):
            try:
                page_content = nlp_service._select_random_content(pages_content)
                question_data = nlp_service.generate_mcq_question(
                    page_content["content"], 
                    page_content["page_number"]
                )
                if question_data:
                    question = Question(quiz_id=quiz.id, **question_data)
                    questions.append(question)
                    print(f"Generated MCQ {i+1}")
                else:
                    print(f"Failed to generate MCQ {i+1}")
            except Exception as e:
                print(f"Error generating MCQ {i+1}: {str(e)}")
        
        # Generate Short Answer questions
        print(f"Generating {question_config.short_answer_count} Short Answer questions...")
        for i in range(question_config.short_answer_count):
            try:
                page_content = nlp_service._select_random_content(pages_content)
                question_data = nlp_service.generate_short_answer_question(
                    page_content["content"], 
                    page_content["page_number"]
                )
                if question_data:
                    question = Question(quiz_id=quiz.id, **question_data)
                    questions.append(question)
                    print(f"Generated Short Answer {i+1}")
                else:
                    print(f"Failed to generate Short Answer {i+1}")
            except Exception as e:
                print(f"Error generating Short Answer {i+1}: {str(e)}")
        
        # Generate True/False questions
        print(f"Generating {question_config.true_false_count} True/False questions...")
        for i in range(question_config.true_false_count):
            try:
                page_content = nlp_service._select_random_content(pages_content)
                question_data = nlp_service.generate_true_false_question(
                    page_content["content"], 
                    page_content["page_number"]
                )
                if question_data:
                    question = Question(quiz_id=quiz.id, **question_data)
                    questions.append(question)
                    print(f"Generated True/False {i+1}")
                else:
                    print(f"Failed to generate True/False {i+1}")
            except Exception as e:
                print(f"Error generating True/False {i+1}: {str(e)}")
        
        print(f"Total questions generated: {len(questions)}")
        
        # Save all questions
        if questions:
            db.add_all(questions)
        
        # Update quiz total questions
        quiz.total_questions = len(questions)
        db.commit()
        db.refresh(quiz)
        
        print(f"Quiz generation completed successfully")
        return quiz
    
    except Exception as e:
        print(f"Error during quiz generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        os.unlink(tmp_file_path)

@router.get("/", response_model=List[QuizSummary])
async def get_user_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes for the current user"""
    quizzes = db.query(Quiz).filter(Quiz.user_id == current_user.id).all()
    return quizzes

@router.get("/{quiz_id}", response_model=QuizSchema)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific quiz with questions"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    return quiz

@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate score"""
    print(f"Received submission for quiz {quiz_id}")
    print(f"Number of answers: {len(submission.answers)}")
    print(f"Submission data: {submission}")
    
    # Check if quiz exists and belongs to user
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        print(f"Quiz {quiz_id} not found for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID {quiz_id} not found or you don't have permission to access it"
        )
    
    print(f"Quiz found with {len(quiz.questions)} questions")
    
    # Validate that all question IDs in submission belong to this quiz
    quiz_question_ids = {q.id for q in quiz.questions}
    submission_question_ids = {answer.question_id for answer in submission.answers}
    
    invalid_question_ids = submission_question_ids - quiz_question_ids
    if invalid_question_ids:
        print(f"Invalid question IDs in submission: {invalid_question_ids}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question IDs: {list(invalid_question_ids)}"
        )
    
    # Calculate score and build detailed per-question results
    correct_answers = 0
    total_questions = len(quiz.questions)
    results = []
    
    for answer in submission.answers:
        question = db.query(Question).filter(Question.id == answer.question_id).first()
        if question:
            is_correct = question.correct_answer.lower().strip() == answer.user_answer.lower().strip()
            if is_correct:
                correct_answers += 1

            results.append({
                "question_id": question.id,
                "question_text": question.question_text,
                "user_answer": answer.user_answer,
                "correct_answer": question.correct_answer,
                "is_correct": is_correct,
                "source_page": question.source_page,
                "source_context": question.source_context_snippet,
                "bloom_level": question.bloom_level,
            })
    
    # Update quiz with aggregated score and persist detailed results
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    quiz.score = score
    quiz.total_questions = total_questions
    # Store the most recent detailed results as JSON text
    try:
        quiz.results_data = json.dumps(results)
    except TypeError:
        # Fallback: if something isn't serializable, skip storing details
        quiz.results_data = None

    db.commit()
    
    print(f"Quiz submitted successfully. Score: {score}%")
    
    return {
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "results": results
    }

@router.get("/{quiz_id}/results")
async def get_quiz_results(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get quiz results.

    If detailed per-question results were stored on submission, return them so the
    frontend can show which questions were right/wrong, even when the user comes
    back to the results page later (e.g. from the dashboard).
    """
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id,
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found",
        )
    
    # Check if quiz has been submitted (has a score)
    if quiz.score is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz has not been submitted yet",
        )

    detailed_results = []
    correct_answers = 0

    # Try to load the stored detailed results if available
    if getattr(quiz, "results_data", None):
        try:
            detailed_results = json.loads(quiz.results_data)
        except (json.JSONDecodeError, TypeError):
            detailed_results = []

    # If we have detailed results, recompute correct answers from them
    if detailed_results:
        for item in detailed_results:
            if item.get("is_correct"):
                correct_answers += 1
    else:
        # Fallback: no stored details; just approximate from score
        correct_answers = int(round((quiz.score or 0) / 100 * (quiz.total_questions or 0)))

    return {
        "score": quiz.score,
        "correct_answers": correct_answers,
        "total_questions": quiz.total_questions,
        "quiz_title": quiz.title,
        "results": detailed_results,
        "submitted": True,
    }

@router.get("/{quiz_id}/export/docx")
async def export_quiz_docx(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export quiz as Word document"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    if not quiz.questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot export quiz with no questions"
        )
    
    try:
        # Generate Word document
        doc_io = export_service.generate_exam_paper(quiz)
        
        # Convert BytesIO to iterator for StreamingResponse
        def iter_file():
            doc_io.seek(0)
            yield doc_io.read()
        
        # Clean filename for download
        safe_filename = "".join(c for c in quiz.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_filename = safe_filename.replace(' ', '_')
        
        return StreamingResponse(
            iter_file(),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={safe_filename}_exam.docx"}
        )
    except Exception as e:
        print(f"Error generating export: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate document export"
        )

@router.put("/{quiz_id}", response_model=QuizSchema)
async def update_quiz(
    quiz_id: int,
    quiz_update: QuizUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update quiz details"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    # Update fields
    for field, value in quiz_update.dict(exclude_unset=True).items():
        setattr(quiz, field, value)
    
    db.commit()
    db.refresh(quiz)
    
    return quiz

@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a quiz"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    db.delete(quiz)
    db.commit()
    
    return {"message": "Quiz deleted successfully"}