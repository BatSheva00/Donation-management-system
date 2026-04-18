"""
Dependency injection for FastAPI endpoints
"""

from functools import lru_cache
import sys
from pathlib import Path

# Add modules to Python path
MODULES_PATH = Path(__file__).parent.parent.parent / "modules"
if str(MODULES_PATH) not in sys.path:
    sys.path.insert(0, str(MODULES_PATH))

from ollama_client import OllamaClient
from text_to_speech_gtts import TextToSpeechGTTS
from document_scanner import DocumentScanner
from translator import Translator
from image_analyzer import ImageAnalyzer
from voice_transcriber import VoiceTranscriber

from app.core.config import settings


@lru_cache()
def get_ollama_client() -> OllamaClient:
    """Get Ollama client instance"""
    return OllamaClient(base_url=settings.OLLAMA_URL)


@lru_cache()
def get_ollama_service() -> OllamaClient:
    """Alias for get_ollama_client for backward compatibility"""
    return get_ollama_client()


@lru_cache()
def get_tts_service() -> TextToSpeechGTTS:
    """Get Text-to-Speech service instance (Google TTS)"""
    return TextToSpeechGTTS()


@lru_cache()
def get_ocr_service() -> DocumentScanner:
    """Get OCR service instance"""
    return DocumentScanner()


@lru_cache()
def get_translator_service() -> Translator:
    """Get Translator service instance"""
    ollama_client = get_ollama_client()
    return Translator(ollama_client)


@lru_cache()
def get_image_analyzer() -> ImageAnalyzer:
    """Get Image Analyzer instance"""
    return ImageAnalyzer()


@lru_cache()
def get_voice_transcriber_service() -> VoiceTranscriber:
    """Get Voice Transcriber service instance"""
    return VoiceTranscriber()

