from fastapi import Request, Response
from fastapi.responses import JSONResponse
import time
import logging
from typing import Callable

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next: Callable) -> Response:
    """Middleware to log all requests"""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = time.time() - start_time
    
    # Log response
    logger.info(f"Response: {response.status_code} - {process_time:.4f}s")
    
    # Add processing time to response headers
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

async def error_handler(request: Request, call_next: Callable) -> Response:
    """Middleware to handle errors gracefully"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred"
            }
        )