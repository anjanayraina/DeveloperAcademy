"""
GitHub API Router — retrieves and logs mock GitHub commit and PR activities.
"""
import random
from fastapi import APIRouter
from src.services.db import get_or_create_user, log_github_activity

router = APIRouter()

MOCK_MESSAGES = [
    "feat: implement ERC-20 token standard",
    "fix: fix reentrancy guard in staking pool",
    "docs: document Morpheus smart agents compute flow",
    "test: add coverage for DAO voting timelock",
    "refactor: optimize gas cost of signature validation",
    "chore: update dependencies in package.json",
    "feat: add HD Wallet BIP-44 key derivation script"
]

@router.get("/activity/{user_id}")
async def get_github_activity(user_id: str):
    """Retrieve GitHub activity logs. Appends a new mock commit to simulate live syncing."""
    user = await get_or_create_user(user_id)
    
    # Simulate a new commit push on request to demonstrate active tracking
    sha = "".join(random.choices("0123456789abcdef", k=8))
    msg = random.choice(MOCK_MESSAGES)
    await log_github_activity(user_id, message=msg, commit_sha=sha)
    
    # Re-fetch user to get the complete pushed history list
    updated_user = await get_or_create_user(user_id)
    return updated_user.get("github_activities", [])
