"""
Forum API Router — coordinates discussion threads, replies, and posts in MongoDB.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from src.services.db import get_forum_collection
from src.models.forum import CreateThreadRequest, CreateCommentRequest
from src.services.auth_helper import verify_token

router = APIRouter()

@router.get("/threads")
async def get_threads(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """List forum threads, with search and category filters."""
    coll = get_forum_collection()
    query = {}
    
    if category and category != "All" and category != "All Topics":
        query["category"] = category
        
    if search:
        # Simple case-insensitive regex search on title or content
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = coll.find(query).sort("created_at", -1)
    threads = []
    async for doc in cursor:
        doc["thread_id"] = doc.get("_id")
        threads.append(doc)
    return threads

@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str):
    """Retrieve a single thread detail, and increment its view count."""
    coll = get_forum_collection()
    
    # Increment view count in DB
    await coll.update_one(
        {"_id": thread_id},
        {"$inc": {"views_count": 1}}
    )
    
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    thread["thread_id"] = thread.get("_id")
    return thread

@router.post("/threads")
async def create_thread(req: CreateThreadRequest, user_id: str = Depends(verify_token)):
    """Submit a new discussion thread to the forum."""
    if not req.title.strip() or not req.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")
        
    coll = get_forum_collection()
    tid = f"thread-{uuid.uuid4().hex[:8]}"
    
    new_thread = {
        "_id": tid,
        "thread_id": tid,
        "title": req.title.strip(),
        "author": user_id,
        "category": req.category,
        "content": req.content.strip(),
        "tags": [t.strip().lower() for t in req.tags if t.strip()],
        "replies_count": 0,
        "views_count": 0,
        "likes_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "comments": []
    }
    
    await coll.insert_one(new_thread)
    return new_thread

@router.post("/threads/{thread_id}/comments")
async def create_comment(thread_id: str, req: CreateCommentRequest, user_id: str = Depends(verify_token)):
    """Post a reply comment inside a discussion thread."""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Comment content cannot be empty")
        
    coll = get_forum_collection()
    thread = await coll.find_one({"_id": thread_id})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    cid = f"comment-{uuid.uuid4().hex[:8]}"
    new_comment = {
        "comment_id": cid,
        "author": user_id,
        "content": req.content.strip(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await coll.update_one(
        {"_id": thread_id},
        {
            "$push": {"comments": new_comment},
            "$inc": {"replies_count": 1}
        }
    )
    
    return new_comment
