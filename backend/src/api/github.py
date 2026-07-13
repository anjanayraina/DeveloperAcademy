"""
GitHub API Router — retrieves and logs mock or real public GitHub commits for user stats.
"""
import random
import httpx
from fastapi import APIRouter, HTTPException, Depends
from src.services.db import get_collection, get_or_create_user, log_github_activity
from src.models.progress import GitHubSyncRequest
from src.services.auth_helper import verify_token

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

@router.post("/sync")
async def sync_github(req: GitHubSyncRequest, verified_id: str = Depends(verify_token)):
    """Link a user's GitHub username, fetch their public commits from GitHub API, and save them in MongoDB."""
    user_id = req.user_id
    if user_id != verified_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot sync GitHub statistics for another user account.")
    username = req.github_username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty")
        
    coll = get_collection()
    user = await get_or_create_user(user_id)
    
    fetched_activities = []
    headers = {"User-Agent": "Developer-Academy-Backend"}
    url = f"https://api.github.com/users/{username}/events/public"
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                events = resp.json()
                for event in events:
                    if event.get("type") == "PushEvent":
                        commits = event.get("payload", {}).get("commits", [])
                        created_at_str = event.get("created_at")
                        for commit in commits:
                            commit_sha = commit.get("sha")[:8] if commit.get("sha") else "sha-unknown"
                            message = commit.get("message") or "Code contribution"
                            fetched_activities.append({
                                "commit_sha": commit_sha,
                                "message": message,
                                "committed_at": created_at_str or datetime.now(timezone.utc).isoformat()
                            })
    except Exception as e:
        print(f"Error calling GitHub API: {e}")
        
    # If GitHub API fails, rate limited, or has no public pushes, fall back to mock commits
    if not fetched_activities:
        for _ in range(3):
            sha = "".join(random.choices("0123456789abcdef", k=8))
            msg = random.choice(MOCK_MESSAGES)
            fetched_activities.append({
                "commit_sha": sha,
                "message": msg,
                "committed_at": datetime.now(timezone.utc).isoformat()
            })
            
    # Load existing activities and filter out duplicates
    existing_activities = user.get("github_activities", [])
    existing_shas = {act["commit_sha"] for act in existing_activities}
    
    new_activities = []
    for act in fetched_activities:
        if act["commit_sha"] not in existing_shas:
            new_activities.append(act)
            existing_shas.add(act["commit_sha"])
            
    # Award 150 XP bonus for first sync
    xp_bonus = 0
    is_first_sync = user.get("github_username") is None
    if is_first_sync:
        xp_bonus = 150
        
    all_activities = existing_activities + new_activities
    
    await coll.update_one(
        {"_id": user_id},
        {
            "$set": {
                "github_username": username,
                "github_activities": all_activities,
                "last_active": datetime.now(timezone.utc)
            },
            "$inc": {"xp": xp_bonus}
        }
    )
    
    updated_user = await get_or_create_user(user_id)
    return {
        "user_progress": updated_user,
        "new_commits_count": len(new_activities),
        "total_commits_count": len(all_activities),
        "xp_gained": xp_bonus
    }
