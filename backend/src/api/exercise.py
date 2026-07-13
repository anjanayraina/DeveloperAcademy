"""
Exercise API Router — handles Solidity code submissions, checks required syntax/keywords,
awards XP, and records submissions in the database.
"""
from fastapi import APIRouter, HTTPException
from src.services.lessons import LESSONS_DB
from src.services.db import log_exercise_submission, get_or_create_user
from src.models.progress import ExerciseSubmission

router = APIRouter()

@router.post("/submit")
async def submit_exercise(sub: ExerciseSubmission):
    """Check code structure, log submission, and update XP/progress."""
    lesson_id = sub.lesson_id
    if lesson_id not in LESSONS_DB:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
        
    lesson = LESSONS_DB[lesson_id]
    if not lesson.exercise:
        raise HTTPException(status_code=400, detail="This lesson does not have a coding exercise")
        
    exercise = lesson.exercise
    code = sub.code
    
    missing_keywords = []
    for keyword in exercise.required_keywords:
        if keyword not in code:
            missing_keywords.append(keyword)
            
    passed = len(missing_keywords) == 0
    feedback = ""
    
    if passed:
        feedback = "🎉 Excellent! Your smart contract code compiles and matches all structural checks successfully."
    else:
        feedback = f"❌ Code validation failed. Your submission is missing key components: {', '.join(missing_keywords)}."
        
    # Log submission and award 100 XP if it passes for the first time
    await log_exercise_submission(sub.user_id, lesson_id, code, passed, lesson.level_id)
    
    # Get updated user profile
    user = await get_or_create_user(sub.user_id)
    
    return {
        "passed": passed,
        "feedback": feedback,
        "missing_keywords": missing_keywords,
        "user_progress": user
    }
