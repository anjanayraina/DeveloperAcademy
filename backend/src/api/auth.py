"""
Authentication API Routers — handles real GitHub OAuth exchange and Wallet signature verification.
"""
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.config import settings
from src.services.db import get_or_create_user
from eth_account import Account
from eth_account.messages import encode_defunct

router = APIRouter()

class GithubAuthRequest(BaseModel):
    username: str | None = None
    code: str | None = None

class WalletAuthRequest(BaseModel):
    address: str
    message: str | None = None
    signature: str | None = None

@router.post("/github")
async def auth_github(req: GithubAuthRequest):
    """Authenticate via GitHub. Supports OAuth code exchanges and username fallbacks."""
    username = None
    
    # 1. Real GitHub OAuth Code Exchange Flow
    if req.code:
        if not settings.github_client_id or not settings.github_client_secret:
            raise HTTPException(
                status_code=400, 
                detail="GitHub OAuth is not configured on the backend. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the env file."
            )
        
        headers = {"Accept": "application/json"}
        data = {
            "client_id": settings.github_client_id,
            "client_secret": settings.github_client_secret,
            "code": req.code,
            "redirect_uri": settings.github_redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://github.com/login/oauth/access_token", headers=headers, data=data)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to request access token from GitHub.")
            
            token_data = resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                raise HTTPException(
                    status_code=400, 
                    detail=f"GitHub OAuth error: {token_data.get('error_description', 'No access token returned.')}"
                )
            
            # Fetch user info using the access token
            user_headers = {
                "Authorization": f"Bearer {access_token}",
                "User-Agent": "Developer-Academy-Backend"
            }
            user_resp = await client.get("https://api.github.com/user", headers=user_headers)
            if user_resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to retrieve profile info from GitHub.")
            
            user_info = user_resp.json()
            username = user_info.get("login")
            
    # 2. Fallback Username Flow
    elif req.username:
        username = req.username.strip()
        
    if not username:
        raise HTTPException(status_code=400, detail="Authentication credentials could not be verified.")

    user_id = f"gh-{username}"
    user = await get_or_create_user(user_id, auth_type="github")
    return user

@router.post("/wallet")
async def auth_wallet(req: WalletAuthRequest):
    """Authenticate via Crypto wallet address. Integrates real ECDSA signature verification."""
    address = req.address.strip().lower()
    if not address.startswith("0x") or len(address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address format")
    
    # Verify cryptographic signature if provided
    if req.message and req.signature:
        try:
            message_hash = encode_defunct(text=req.message)
            recovered_address = Account.recover_message(message_hash, signature=req.signature)
            if recovered_address.lower() != address:
                raise HTTPException(status_code=400, detail="Wallet signature verification failed.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cryptographic signature check failed: {e}")
            
    user_id = f"wallet-{address}"
    user = await get_or_create_user(user_id, auth_type="wallet")
    return user

@router.get("/config")
async def get_auth_config():
    """Retrieve public authentication configurations (e.g. GitHub Client ID)."""
    return {
        "github_client_id": settings.github_client_id,
        "github_redirect_uri": settings.github_redirect_uri
    }

