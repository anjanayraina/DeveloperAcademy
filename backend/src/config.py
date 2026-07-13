"""
Application configuration — reads from .env file.
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_env: str = "development"
    cors_origins: List[str] = ["http://localhost:5173"]
    mongodb_uri: str = "mongodb://localhost:27017/developer_academy"
    secret_key: str = "developer-academy-super-secret-key-1337-signature-verify"

    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:5173"

    # LLM
    default_llm: str = "mock"  # "mock" | "claude" | "hermes"
    claude_api_key: str = ""
    hermes_api_url: str = "http://localhost:11434/v1"
    hermes_model: str = "hermes-3-llama-3.1-8b"


settings = Settings()
