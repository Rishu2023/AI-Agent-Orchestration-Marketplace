from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "AI Agent Orchestration Marketplace"
    debug: bool = True
    database_url: str = "sqlite+aiosqlite:///./marketplace.db"
    secret_key: str = "change-me-in-production-super-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    stripe_secret_key: Optional[str] = None
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
