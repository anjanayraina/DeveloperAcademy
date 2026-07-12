"""
Community Forum schema — future feature, not yet surfaced in UI.
Models threaded posts, tags, and upvote mechanics.
"""
from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ForumCategory(str, Enum):
    GENERAL = "general"
    SMART_CONTRACTS = "smart-contracts"
    DEFI = "defi"
    DAO = "dao"
    HELP = "help"
    SHOWCASE = "showcase"


class ForumReply(BaseModel):
    reply_id: str
    author_id: str
    body: str
    upvotes: int = 0
    created_at: datetime
    is_accepted_answer: bool = False


class ForumPost(BaseModel):
    post_id: str
    author_id: str
    title: str
    body: str
    category: ForumCategory = ForumCategory.GENERAL
    tags: List[str] = []
    upvotes: int = 0
    views: int = 0
    replies: List[ForumReply] = []
    replies_count: int = 0
    is_pinned: bool = False
    is_solved: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    related_level_id: Optional[int] = Field(default=None, ge=1, le=6)
