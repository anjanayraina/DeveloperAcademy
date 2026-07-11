"""
Learning Analytics schema — future feature, not yet surfaced in UI.
Tracks time-on-task, quiz performance, and weak topic identification.
"""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class QuizAttempt(BaseModel):
    quiz_id: str
    level_id: int
    score: float = Field(..., ge=0.0, le=100.0)
    time_taken_seconds: int
    attempted_at: datetime


class WeakTopic(BaseModel):
    topic: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    recommended_resources: List[str] = []


class LearningAnalytics(BaseModel):
    user_id: str
    total_time_minutes: int = 0
    quiz_attempts: List[QuizAttempt] = []
    weak_topics: List[WeakTopic] = []
    avg_quiz_score: Optional[float] = None
    learning_velocity: Optional[float] = None  # lessons/day
    last_computed_at: Optional[datetime] = None
