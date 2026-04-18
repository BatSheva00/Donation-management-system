"""
Request and Response models
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


# Health Check
class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    services: Dict[str, str]


# Description Generator
class DescriptionRequest(BaseModel):
    title: str
    category: str
    model: Optional[str] = "llama3.2:1b"  # Faster model


class DescriptionResponse(BaseModel):
    description: str
    title: str
    category: str


# Text-to-Speech
class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    rate: Optional[str] = "+0%"
    detect_language: bool = True


class TTSResponse(BaseModel):
    audio_url: str
    detected_language: Optional[str] = None
    file_size: int
    duration_estimate: float


# Translator
class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str = "auto"
    model: Optional[str] = "llama3.1"


class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str


# OCR Document Scanner
class OCRResponse(BaseModel):
    full_text: str
    word_count: int
    confidence: float
    language_detected: str
    document_type: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None


# Image Analysis
class ImageAnalysisResponse(BaseModel):
    suggested_category: str
    is_food: bool
    quality_score: float
    detected_items: List[Dict[str, Any]]
    confidence: float


# Voice Transcription
class TranscriptionResponse(BaseModel):
    text: str
    detected_language: str

