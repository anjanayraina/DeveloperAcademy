"""
GitHub API Router — retrieves and logs mock or real public GitHub commits for user stats.
"""
import random
import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from src.services.db import get_collection, get_or_create_user, log_github_activity
from src.models.progress import GitHubSyncRequest
from src.services.auth_helper import verify_token

router = APIRouter()

@router.get("/org-stats")
async def get_github_org_stats():
    """Retrieve dynamic repository stats, contributors, issues, PRs, and releases of the Academy Org."""
    repositories = [
        {
            "name": "solidity-starter-kit",
            "description": "Comprehensive starter template for writing, compiling, testing, and deploying Solidity smart contracts using Hardhat and Foundry.",
            "language": "Solidity",
            "stars": 42,
            "forks": 18,
            "open_issues": 3,
            "url": "https://github.com/developer-academy/solidity-starter-kit"
        },
        {
            "name": "defi-staking-template",
            "description": "A secure yield farming and staking contract framework featuring reward logic, mathematical precision checks, and a React UI integration.",
            "language": "Solidity",
            "stars": 29,
            "forks": 12,
            "open_issues": 1,
            "url": "https://github.com/developer-academy/defi-staking-template"
        },
        {
            "name": "dao-governance-contracts",
            "description": "Governance contracts utilizing timelocks, proposal voting models, quorum calculations, and delegation mechanisms.",
            "language": "TypeScript",
            "stars": 35,
            "forks": 9,
            "open_issues": 2,
            "url": "https://github.com/developer-academy/dao-governance-contracts"
        },
        {
            "name": "token-amm-pool",
            "description": "Constant product automated market maker (AMM) contracts featuring liquidity addition/removal, swap algorithms, and LP token minting.",
            "language": "Solidity",
            "stars": 48,
            "forks": 15,
            "open_issues": 0,
            "url": "https://github.com/developer-academy/token-amm-pool"
        }
    ]

    contributors = [
        {"username": "BlockMaster", "avatar": "BM", "contributions": 142, "role": "Maintainer"},
        {"username": "AliceDev", "avatar": "AD", "contributions": 98, "role": "Contributor"},
        {"username": "SmartBuilder", "avatar": "SB", "contributions": 74, "role": "Contributor"},
        {"username": "MorpheusFan", "avatar": "MF", "contributions": 34, "role": "Contributor"}
    ]

    issues = [
        {"id": "#104", "title": "Optimize gas usage in AMM token swaps", "repo": "token-amm-pool", "status": "open", "author": "BlockMaster", "created_at": "3 days ago"},
        {"id": "#89", "title": "Implement checks for flash loan reentrancy in Staking contract", "repo": "defi-staking-template", "status": "open", "author": "AliceDev", "created_at": "5 days ago"},
        {"id": "#112", "title": "Write unit tests for timelock delay modifier", "repo": "dao-governance-contracts", "status": "open", "author": "SmartBuilder", "created_at": "1 week ago"}
    ]

    prs = [
        {"id": "#115", "title": "Add helper scripts for BIP-44 key derivations", "repo": "solidity-starter-kit", "status": "reviewing", "author": "SmartBuilder", "created_at": "2 days ago"},
        {"id": "#92", "title": "Implement multi-token reward calculations", "repo": "defi-staking-template", "status": "merging", "author": "AliceDev", "created_at": "4 days ago"}
    ]

    releases = [
        {"version": "v1.0.0-beta", "title": "Academy Starter Packages Beta Release", "published_at": "2 weeks ago", "download_url": "#"}
    ]

    return {
        "repositories": repositories,
        "contributors": contributors,
        "issues": issues,
        "prs": prs,
        "releases": releases
    }

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
    """Retrieve user's logged GitHub activities."""
    user = await get_or_create_user(user_id)
    return user.get("github_activities", [])

@router.get("/stats/{username}")
async def get_github_user_stats(username: str):
    """Fetch live public GitHub statistics (public repos, merged PRs, followers, total commits) directly from GitHub API."""
    username = username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="GitHub username required.")

    headers = {
        "User-Agent": "Developer-Academy-Backend",
        "Accept": "application/vnd.github.v3+json"
    }

    async with httpx.AsyncClient() as client:
        # 1. Fetch user profile
        user_resp = await client.get(f"https://api.github.com/users/{username}", headers=headers, timeout=10)
        if user_resp.status_code != 200:
            raise HTTPException(status_code=user_resp.status_code, detail=f"GitHub user '{username}' not found.")
        
        user_data = user_resp.json()
        public_repos = user_data.get("public_repos", 0)
        followers = user_data.get("followers", 0)
        avatar_url = user_data.get("avatar_url", "")
        name = user_data.get("name") or username

        # 2. Fetch Merged PRs count via search API
        merged_prs = 0
        try:
            pr_resp = await client.get(
                f"https://api.github.com/search/issues?q=author:{username}+type:pr+is:merged",
                headers=headers,
                timeout=10
            )
            if pr_resp.status_code == 200:
                merged_prs = pr_resp.json().get("total_count", 0)
        except Exception as e:
            print(f"Error fetching merged PRs: {e}")

        # 3. Fetch Total Commits count via search API
        total_commits = 0
        try:
            commit_headers = {
                "User-Agent": "Developer-Academy-Backend",
                "Accept": "application/vnd.github.cloak-preview+json"
            }
            commit_resp = await client.get(
                f"https://api.github.com/search/commits?q=author:{username}",
                headers=commit_headers,
                timeout=10
            )
            if commit_resp.status_code == 200:
                total_commits = commit_resp.json().get("total_count", 0)
        except Exception as e:
            print(f"Error fetching commits count: {e}")

        return {
            "username": username,
            "name": name,
            "avatar_url": avatar_url,
            "public_repos": public_repos,
            "followers": followers,
            "merged_prs": merged_prs,
            "total_commits": total_commits
        }

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
