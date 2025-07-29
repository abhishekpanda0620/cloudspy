from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Import routers
from routers import aws, azure, gcp, dashboard, auth

# Import middleware and config
from middleware import log_requests, error_handler
from config import settings

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("CloudSpy Backend starting up...")
    yield
    # Shutdown
    print("CloudSpy Backend shutting down...")

app = FastAPI(
    title="CloudSpy API",
    description="Multi-cloud cost monitoring and analytics platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add custom middleware
app.middleware("http")(log_requests)
app.middleware("http")(error_handler)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(aws.router, prefix="/api/v1")
app.include_router(azure.router, prefix="/api/v1")
app.include_router(gcp.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "CloudSpy API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "cloudspy-backend",
        "version": "1.0.0"
    }

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development
        "http://frontend:3000",   # Docker frontend
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
