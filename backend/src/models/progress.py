"""
Progress Pydantic models — active schemas for the progress tracking API.
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class LevelProgress(BaseModel):
    level_id: int = Field(..., ge=1, le=6, description="Course level (1–6)")
    title: str
    completed_lessons: int = Field(default=0, ge=0)
    total_lessons: int = Field(default=0, ge=0)
    is_unlocked: bool = False
    completed_at: Optional[datetime] = None

    @property
    def completion_pct(self) -> float:
        if self.total_lessons == 0:
            return 0.0
        return round(self.completed_lessons / self.total_lessons * 100, 1)


class UserProgress(BaseModel):
    user_id: str
    xp: int = Field(default=0, ge=0)
    streak_days: int = Field(default=0, ge=0)
    current_level: int = Field(default=1, ge=1, le=6)
    overall_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    levels: List[LevelProgress] = []
    last_active: Optional[datetime] = None


class ProgressUpdate(BaseModel):
    level_id: int = Field(..., ge=1, le=6)
    completed_lessons: int = Field(..., ge=0)
    xp_gained: int = Field(default=0, ge=0)

class ExerciseSubmission(BaseModel):
    user_id: str
    lesson_id: str
    code: str

class QuizSubmission(BaseModel):
    user_id: str
    lesson_id: str
    answers: List[int]

class GitHubSyncRequest(BaseModel):
    user_id: str
    github_username: str

