"""
Courses and Lessons API Routers — retrieves structured courses list and individual lessons.
"""
from fastapi import APIRouter, HTTPException
from src.services.lessons import get_courses_list, LESSONS_DB

router = APIRouter()

@router.get("")
async def list_courses():
    """Retrieve all levels and their nested lessons list."""
    return get_courses_list()

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    """Retrieve detailed content for a single lesson (including quiz and exercise meta)."""
    if lesson_id not in LESSONS_DB:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
    return LESSONS_DB[lesson_id]
