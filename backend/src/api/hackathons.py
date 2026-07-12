"""
Hackathons API Router — handles hackathon event retrievals, user registrations, and project submissions.
"""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from src.services.db import get_collection, get_hackathons_collection, get_or_create_user

router = APIRouter()

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

@router.get("")
async def get_hackathons(user_id: Optional[str] = Query(None)):
    """Retrieve all hackathons, marked with user registration and submission state if user_id is provided."""
    coll = get_hackathons_collection()
    cursor = coll.find({})
    
    hacks = []
    async for doc in cursor:
        doc["hackathon_id"] = doc.get("_id")
        doc["is_registered"] = False
        doc["submission"] = None
        hacks.append(doc)
        
    if user_id:
        user = await get_or_create_user(user_id)
        registered_ids = set(user.get("hackathons_registered", []))
        submissions = user.get("hackathon_submissions", {})
        
        for hack in hacks:
            hid = hack["hackathon_id"]
            if hid in registered_ids:
                hack["is_registered"] = True
            if hid in submissions:
                hack["submission"] = submissions[hid]
                
    return hacks

@router.post("/{hackathon_id}/register")
async def register_hackathon(hackathon_id: str, req: RegisterRequest):
    """Register a user for a specific hackathon."""
    user_id = req.user_id
    user = await get_or_create_user(user_id)
    
    # Check if already registered
    registered = user.get("hackathons_registered", [])
    if hackathon_id in registered:
        return user
        
    coll = get_collection()
    await coll.update_one(
        {"_id": user_id},
        {"$push": {"hackathons_registered": hackathon_id}}
    )
    
    # Return updated user progress
    updated_user = await get_or_create_user(user_id)
    return updated_user

@router.post("/{hackathon_id}/submit")
async def submit_project(hackathon_id: str, req: SubmitProjectRequest):
    """Submit a project solution for a hackathon, and award 200 XP."""
    user_id = req.user_id
    user = await get_or_create_user(user_id)
    
    # Verify user is registered first
    registered = user.get("hackathons_registered", [])
    if hackathon_id not in registered:
        raise HTTPException(
            status_code=400, 
            detail="You must register for the hackathon before submitting a project."
        )
        
    submission = {
        "project_name": req.project_name.strip(),
        "tagline": req.tagline.strip(),
        "description": req.description.strip(),
        "video_link": req.video_link.strip(),
        "code_link": req.code_link.strip(),
        "team_size": req.team_size,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "is_submitted": True
    }
    
    coll = get_collection()
    
    # If this is their first submission for this hackathon, award 200 XP
    previous_submissions = user.get("hackathon_submissions", {})
    already_submitted = hackathon_id in previous_submissions
    xp_bonus = 200 if not already_submitted else 0
    
    await coll.update_one(
        {"_id": user_id},
        {
            "$set": {f"hackathon_submissions.{hackathon_id}": submission},
            "$inc": {"xp": xp_bonus}
        }
    )
    
    updated_user = await get_or_create_user(user_id)
    return updated_user
