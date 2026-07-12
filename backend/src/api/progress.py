"""
Progress Tracking API — GET and POST user progress.
Uses an in-memory store for the MVP; swap for a real DB later.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from src.models.progress import UserProgress, LevelProgress, ProgressUpdate

router = APIRouter()

# ─── Level metadata ──────────────────────────────────────────────────────────
LEVEL_META = [
    {"level_id": 1, "title": "Blockchain Fundamentals", "total_lessons": 8},
    {"level_id": 2, "title": "Wallet Development",       "total_lessons": 6},
    {"level_id": 3, "title": "Smart Contract Development","total_lessons": 10},
    {"level_id": 4, "title": "DeFi Fundamentals",        "total_lessons": 8},
    {"level_id": 5, "title": "DAO Governance",            "total_lessons": 6},
    {"level_id": 6, "title": "MOR Finance Protocols",    "total_lessons": 7},
]

# ─── In-memory mock store ─────────────────────────────────────────────────────
def _default_user(user_id: str) -> UserProgress:
    levels = [
        LevelProgress(
            level_id=m["level_id"],
            title=m["title"],
            total_lessons=m["total_lessons"],
            completed_lessons=0,
            is_unlocked=(m["level_id"] == 1),
        )
        for m in LEVEL_META
    ]
    return UserProgress(
        user_id=user_id,
        xp=0,
        streak_days=0,
        current_level=1,
        overall_pct=0.0,
        levels=levels,
        last_active=datetime.now(timezone.utc),
    )


# Seed demo user with some progress so the UI looks alive
_demo = _default_user("demo-user")
_demo.xp = 1240
_demo.streak_days = 7
_demo.levels[0].completed_lessons = 8
_demo.levels[0].is_unlocked = True
_demo.levels[1].completed_lessons = 4
_demo.levels[1].is_unlocked = True
_demo.levels[2].completed_lessons = 2
_demo.levels[2].is_unlocked = True
_demo.current_level = 3
_demo.overall_pct = round((8 + 4 + 2) / (8 + 6 + 10 + 8 + 6 + 7) * 100, 1)

_store: dict[str, UserProgress] = {"demo-user": _demo}


def _recalculate(user: UserProgress) -> UserProgress:
    """Recalculate derived fields after an update."""
    total_lessons = sum(l.total_lessons for l in user.levels)
    done_lessons  = sum(l.completed_lessons for l in user.levels)
    user.overall_pct = round(done_lessons / total_lessons * 100, 1) if total_lessons else 0.0
    # Unlock next level when current is complete
    for i, lv in enumerate(user.levels):
        if lv.completed_lessons >= lv.total_lessons and i + 1 < len(user.levels):
            user.levels[i + 1].is_unlocked = True
    return user


# ─── Endpoints ────────────────────────────────────────────────────────────────
@router.get("/{user_id}", response_model=UserProgress)
async def get_progress(user_id: str):
    """Retrieve progress for a user. Creates a default record if not found."""
    if user_id not in _store:
        _store[user_id] = _default_user(user_id)
    return _store[user_id]


@router.post("/{user_id}", response_model=UserProgress)
async def update_progress(user_id: str, update: ProgressUpdate):
    """Update lesson completion and XP for a given level."""
    if user_id not in _store:
        _store[user_id] = _default_user(user_id)

    user = _store[user_id]
    level = next((l for l in user.levels if l.level_id == update.level_id), None)
    if not level:
        raise HTTPException(status_code=404, detail=f"Level {update.level_id} not found")
    if not level.is_unlocked:
        raise HTTPException(status_code=403, detail=f"Level {update.level_id} is locked")

    level.completed_lessons = min(update.completed_lessons, level.total_lessons)
    if level.completed_lessons >= level.total_lessons and not level.completed_at:
        level.completed_at = datetime.now(timezone.utc)
    user.xp += update.xp_gained
    user.last_active = datetime.now(timezone.utc)
    _store[user_id] = _recalculate(user)
    return _store[user_id]
