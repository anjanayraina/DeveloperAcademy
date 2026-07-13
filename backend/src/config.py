from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_env: str 
    cors_origins: List[str] = ["http://localhost:5173"]
    mongodb_uri: str
    secret_key: str
    jwt_algorithm: str

    github_client_id: str 
    github_client_secret: str 
    github_redirect_uri: str 

    default_llm: str = "mock" 
    claude_api_key: str = ""
    hermes_api_url: str = "http://localhost:11434/v1"
    hermes_model: str = "hermes-3-llama-3.1-8b"


settings = Settings()
