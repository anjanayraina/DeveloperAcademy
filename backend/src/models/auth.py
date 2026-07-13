"""
Authentication Pydantic Models — request bodies for OAuth and wallet sign-in / linking.
"""
from pydantic import BaseModel

class GithubAuthRequest(BaseModel):
    username: str | None = None
    code: str | None = None

class WalletAuthRequest(BaseModel):
    address: str
    message: str | None = None
    signature: str | None = None

class LinkGithubRequest(BaseModel):
    user_id: str
    code: str | None = None
    username: str | None = None

class LinkWalletRequest(BaseModel):
    user_id: str
    address: str
    message: str | None = None
    signature: str | None = None



