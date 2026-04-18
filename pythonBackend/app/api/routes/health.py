"""
Health check endpoint
"""

from fastapi import APIRouter, Depends
import logging

from app.models.schemas import HealthResponse
from app.core.dependencies import (
    get_ollama_client,
    get_tts_service,
    get_ocr_service,
    get_translator_service
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(
    ollama_client = Depends(get_ollama_client)
):
    """
    Check if all services are running and available
    
    Returns service status and connectivity information
    """
    ollama_status = ollama_client.check_connection()
    
    return HealthResponse(
        status="healthy" if ollama_status else "degraded",
        ollama_connected=ollama_status,
        services={
            "ollama": "connected" if ollama_status else "disconnected",
            "tts": "ready",
            "ocr": "ready",
            "translator": "ready" if ollama_status else "unavailable",
            "image_analyzer": "ready"
        }
    )

