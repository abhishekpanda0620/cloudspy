from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Settings
    api_title: str = "CloudSpy API"
    api_version: str = "1.0.0"
    api_description: str = "Multi-cloud cost monitoring and analytics platform"
    
    # Database
    database_url: str = "postgresql://cloudspy_user:cloudspy_password@localhost:5432/cloudspy"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://frontend:3000"
    ]
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    
    # Cloud Provider Settings
    aws_region: str = "us-east-1"
    
    # Logging
    log_level: str = "INFO"
    
    # Environment
    environment: str = "development"
    debug: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()