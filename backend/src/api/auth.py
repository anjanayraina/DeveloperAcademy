import re
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.config import settings
from src.services.db import get_or_create_user
from eth_account import Account
from eth_account.messages import encode_defunct
from src.models.auth import GithubAuthRequest, WalletAuthRequest, LinkGithubRequest, LinkWalletRequest

router = APIRouter()

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

    from src.services.db import get_collection, create_default_user_dict
    coll = get_collection()
    user = await coll.find_one({"github_username": username})
    if not user:
        user = await coll.find_one({"_id": f"gh-{username}"})
    if not user:
        user = await coll.find_one({"_id": username})
    if not user:
        # Auto-signup new user using GitHub username
        user = create_default_user_dict(username, "github")
        user["github_username"] = username
        await coll.insert_one(user)
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
            
    from src.services.db import get_collection
    coll = get_collection()
    user = await coll.find_one({"wallet_address": address})
    if not user:
        user = await coll.find_one({"_id": f"wallet-{address}"})
    if user:
        return user
    else:
        raise HTTPException(
            status_code=400,
            detail="This wallet is not linked to any registered Developer Academy account. Please sign up with GitHub first, then link your wallet from the dashboard."
        )

@router.get("/config")
async def get_auth_config():
    """Retrieve public authentication configurations (e.g. GitHub Client ID)."""
    return {
        "github_client_id": settings.github_client_id,
        "github_redirect_uri": settings.github_redirect_uri
    }





@router.post("/link-github")
async def link_github(req: LinkGithubRequest):
    """Link a GitHub account to the current user profile."""
    from src.services.db import get_collection
    user = await get_or_create_user(req.user_id)
    username = None

    # 1. Real GitHub OAuth Code Exchange Flow
    if req.code:
        if not settings.github_client_id or not settings.github_client_secret:
            raise HTTPException(
                status_code=400, 
                detail="GitHub OAuth is not configured. Cannot perform linking."
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
                raise HTTPException(status_code=400, detail="No access token returned.")
            
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
        raise HTTPException(status_code=400, detail="GitHub username could not be resolved.")

    coll = get_collection()
    # Check if this github account is already linked to ANOTHER user profile
    existing = await coll.find_one({"github_username": username})
    if existing and existing["_id"] != user["_id"]:
        raise HTTPException(status_code=400, detail="This GitHub account is already linked to another profile.")

    # Link the account
    await coll.update_one({"_id": user["_id"]}, {"$set": {"github_username": username}})
    user["github_username"] = username
    return user

@router.post("/link-wallet")
async def link_wallet(req: LinkWalletRequest):
    """Link a Web3 wallet address to the current user profile."""
    from src.services.db import get_collection
    user = await get_or_create_user(req.user_id)
    address = req.address.strip().lower()
    
    if not address.startswith("0x") or len(address) != 42:
        raise HTTPException(status_code=400, detail="Invalid Ethereum address format")

    if req.message and req.signature:
        try:
            message_hash = encode_defunct(text=req.message)
            recovered_address = Account.recover_message(message_hash, signature=req.signature)
            if recovered_address.lower() != address:
                raise HTTPException(status_code=400, detail="Wallet signature verification failed.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cryptographic signature check failed: {e}")

    coll = get_collection()
    # Check if this wallet address is already linked to ANOTHER user profile
    existing = await coll.find_one({"wallet_address": address})
    if existing and existing["_id"] != user["_id"]:
        raise HTTPException(status_code=400, detail="This Wallet is already linked to another profile.")

    # Link the wallet
    await coll.update_one({"_id": user["_id"]}, {"$set": {"wallet_address": address}})
    user["wallet_address"] = address
    return user


