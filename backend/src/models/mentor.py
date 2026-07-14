from pydantic import BaseModel

class MentorChatRequest(BaseModel):
    user_id: str = "demo-user"
    prompt: str
    context: str = ""          # e.g. "Level 3 - Smart Contract Development"
    provider: str | None = None  # override DEFAULT_LLM per-request
