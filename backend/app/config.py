from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://pharmgrid_app:change-me@postgres:5432/pharmgrid"
    jwt_secret: str = "development-only-change-before-deploy"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 30
    cors_origins: str = "http://localhost:4173"
    environment: str = "development"
    email_transport: str = "fake"  # fake | ses
    aws_region: str = "ap-south-1"
    ses_sender: str | None = None
    worker_poll_seconds: int = 5


@lru_cache
def settings() -> Settings:
    return Settings()
