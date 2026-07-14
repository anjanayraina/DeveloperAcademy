"""
Courses and Lessons API Routers — retrieves structured courses list and individual lessons.
"""
from fastapi import APIRouter, HTTPException
from src.services.lessons import get_courses_list, get_track_lessons, LESSONS_DB

router = APIRouter()

@router.get("")
async def list_courses(track: str = "ethereum"):
    """Retrieve all levels and their nested lessons list."""
    return get_courses_list(track)

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str, track: str = "ethereum"):
    """Retrieve detailed content for a single lesson (including quiz and exercise meta)."""
    if lesson_id.startswith("7-"):
        track_lessons = get_track_lessons(track)
        for l in track_lessons:
            if l.id == lesson_id:
                return l
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found for track '{track}'")
    if lesson_id not in LESSONS_DB:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
    return LESSONS_DB[lesson_id]
