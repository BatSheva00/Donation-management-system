"""
Configuration settings for the AI microservice
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "KindLoop AI Microservice"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Temp directory
    TEMP_DIR: str = "/tmp/ai-tools"
    
    # Thread pool
    MAX_WORKERS: int = 4
    
    # File upload limits
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        case_sensitive = True


settings = Settings()

# Export commonly used config values as module-level constants
TEMP_DIR = settings.TEMP_DIR

