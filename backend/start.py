#!/usr/bin/env python3
"""
CloudSpy Backend Startup Script
"""
import uvicorn
import os
from config import settings

if __name__ == "__main__":
    # Get configuration from environment or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 9090))
    reload = settings.debug and settings.environment == "development"
    
    print(f"Starting CloudSpy Backend...")
    print(f"Environment: {settings.environment}")
    print(f"Debug mode: {settings.debug}")
    print(f"Host: {host}:{port}")
    print(f"Reload: {reload}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        log_level=settings.log_level.lower()
    )