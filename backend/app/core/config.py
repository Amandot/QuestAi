from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str = "sqlite:///./questai.db"
    frontend_origins: Optional[str] = None  # Comma-separated list of allowed frontend URLs

    class Config:
        env_file = ".env"

    @property
    def allowed_cors_origins(self) -> List[str]:
        """
        Returns a list of allowed CORS origins.
        If FRONTEND_ORIGINS is set, use that; otherwise fall back to common dev URLs.
        """
        if self.frontend_origins:
            return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

        return [
            "http://localhost:3000",
            "http://localhost:5173",
        ]


settings = Settings()
