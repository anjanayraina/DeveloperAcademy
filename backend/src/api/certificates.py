"""
Certificates API Router — serves certificates earned by the user.
"""
from fastapi import APIRouter
from src.services.db import get_or_create_user

router = APIRouter()

@router.get("/{user_id}")
async def get_user_certificates(user_id: str):
    """Retrieve certificates earned by a specific user."""
    user = await get_or_create_user(user_id)
    return user.get("certificates", [])
