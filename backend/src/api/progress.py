"""
Progress Tracking API — GET and POST user progress.
Integrates with the MongoDB database store.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from src.services.db import get_or_create_user, save_user_progress, complete_lesson_for_user

router = APIRouter()

@router.get("/{user_id}")
async def get_progress(user_id: str):
    """Retrieve progress for a user. Creates a default record if not found in MongoDB."""
    user = await get_or_create_user(user_id)
    return user

@router.post("/{user_id}")
async def update_progress(user_id: str, level_id: int, completed_lessons: int, xp_gained: int):
    """Directly update lesson completion and XP for a given level in MongoDB."""
    user = await get_or_create_user(user_id)
    levels = user.get("levels", [])
    level = next((l for l in levels if l["level_id"] == level_id), None)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level {level_id} not found")
    if not level["is_unlocked"]:
        raise HTTPException(status_code=403, detail=f"Level {level_id} is locked")

    # Set completion counts
    level["completed_lessons"] = min(completed_lessons, level["total_lessons"])
    if level["completed_lessons"] >= level["total_lessons"] and not level.get("completed_at"):
        level["completed_at"] = datetime.now(timezone.utc)
    
    # Recalculate derived fields
    total_lessons = sum(l["total_lessons"] for l in levels)
    done_lessons = sum(l["completed_lessons"] for l in levels)
    overall_pct = round(done_lessons / total_lessons * 100, 1) if total_lessons > 0 else 0.0
    
    for i in range(len(levels)):
        if i == 0:
            levels[i]["is_unlocked"] = True
        else:
            prev = levels[i-1]
            if prev["completed_lessons"] >= prev["total_lessons"]:
                levels[i]["is_unlocked"] = True
                
    unlocked_levels = [lvl["level_id"] for lvl in levels if lvl["is_unlocked"]]
    current_level = max(unlocked_levels) if unlocked_levels else 1

    update_payload = {
        "levels": levels,
        "overall_pct": overall_pct,
        "current_level": current_level,
        "last_active": datetime.now(timezone.utc),
        "xp": user.get("xp", 0) + xp_gained
    }
    
    await save_user_progress(user_id, update_payload)
    return await get_or_create_user(user_id)
