"""
Hackathon tracking schema — future feature, not yet surfaced in UI.
Tracks team participation, submissions, and judging results.
"""
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class SubmissionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    WINNER = "winner"
    DISQUALIFIED = "disqualified"


class HackathonTeamMember(BaseModel):
    user_id: str
    role: str  # e.g. "lead", "developer", "designer"


class HackathonEntry(BaseModel):
    hackathon_id: str
    team_name: str
    members: List[HackathonTeamMember] = []
    project_title: str
    project_description: str = ""
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    submission_status: SubmissionStatus = SubmissionStatus.DRAFT
    submitted_at: Optional[datetime] = None
    score: Optional[float] = None
    judge_comments: Optional[str] = None


class Hackathon(BaseModel):
    hackathon_id: str
    title: str
    description: str
    prize_pool: Optional[str] = None
    starts_at: datetime
    ends_at: datetime
    is_active: bool = False
    entries: List[HackathonEntry] = []

class RegisterRequest(BaseModel):
    user_id: str

class SubmitProjectRequest(BaseModel):
    user_id: str
    project_name: str
    tagline: str
    description: str
    video_link: str
    code_link: str
    team_size: int = 1

