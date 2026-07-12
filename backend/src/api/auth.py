"""
Authentication API Routers — handles GitHub login/registration and wallet connection.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.db import get_or_create_user

router = APIRouter()

class GithubAuthRequest(BaseModel):
    username: str

class WalletAuthRequest(BaseModel):
    address: str

@router.post("/github")
async def auth_github(req: GithubAuthRequest):
    """Authenticate or register a user via GitHub username."""
    username = req.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    
    # Prefix to avoid namespace collision (e.g. if a username matches a wallet address)
    user_id = f"gh-{username}"
    user = await get_or_create_user(user_id, auth_type="github")
    return user

@router.post("/wallet")
async def auth_wallet(req: WalletAuthRequest):
    """Authenticate or register a user via Crypto wallet address."""
    address = req.address.strip().lower()
    if not address.startswith("0x") or len(address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address format")
    
    user_id = f"wallet-{address}"
    user = await get_or_create_user(user_id, auth_type="wallet")
    return user
