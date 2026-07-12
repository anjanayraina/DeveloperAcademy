"""
Dashboard API Router — aggregates user statistics and platform-wide Core KPIs.
"""
from fastapi import APIRouter
from src.services.db import get_or_create_user, get_kpis

router = APIRouter()

@router.get("/{user_id}")
async def get_dashboard_data(user_id: str):
    """Retrieve personal progress metrics and platform-wide Core KPIs."""
    user = await get_or_create_user(user_id)
    kpis = await get_kpis()
    return {
        "user_progress": user,
        "kpis": kpis
    }
