from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    APP_PORT: int = 8000
    TIMEZONE: str = "Asia/Jakarta"

    # Database
    DATABASE_URL: str

    # Supabase Storage
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_BUCKET: str = "datalake"

    # Platform credentials
    TIKTOK_SESSION_ID: Optional[str] = None
    INSTAGRAM_SESSION_ID: Optional[str] = None
    APIFY_API_TOKEN: Optional[str] = None

    # Proxy
    PROXY_SERVER: Optional[str] = None
    PROXY_USERNAME: Optional[str] = None
    PROXY_PASSWORD: Optional[str] = None

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_db_url(cls, v: str) -> str:
        if not v.startswith("postgresql"):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        return v

    @property
    def proxy_config(self) -> Optional[dict]:
        """Build Crawl4AI-compatible proxy config dict if proxy is configured."""
        if self.PROXY_SERVER:
            cfg = {"server": self.PROXY_SERVER}
            if self.PROXY_USERNAME:
                cfg["username"] = self.PROXY_USERNAME
            if self.PROXY_PASSWORD:
                cfg["password"] = self.PROXY_PASSWORD
            return cfg
        return None


settings = Settings()
