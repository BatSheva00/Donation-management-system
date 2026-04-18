from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from app.models.schemas import TranscriptionResponse
from app.core.dependencies import get_voice_transcriber_service
from app.services.async_executor import run_in_executor
from app.core.config import TEMP_DIR
import logging
import os
import tempfile

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form(None),
    transcriber_service = Depends(get_voice_transcriber_service)
):
    """
    Transcribe audio to text with automatic language detection.
    Supports various audio formats (wav, mp3, webm, ogg, etc.)
    """
    temp_audio_path = None
    
    try:
        logger.info(f"Receiving audio file: {audio.filename}, content_type: {audio.content_type}")
        
        # Validate file
        if not audio.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Determine file extension
        file_ext = os.path.splitext(audio.filename)[1] or ".webm"
        
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext, dir=TEMP_DIR) as temp_file:
            temp_audio_path = temp_file.name
            content = await audio.read()
            temp_file.write(content)
            logger.info(f"Saved audio to temporary file: {temp_audio_path} ({len(content)} bytes)")
            logger.info(f"Audio format: {audio.content_type}, filename: {audio.filename}")
        
        # Try to get audio duration using ffprobe if available
        try:
            import subprocess
            duration_check = subprocess.run(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', 
                 '-of', 'default=noprint_wrappers=1:nokey=1', temp_audio_path],
                capture_output=True, text=True, timeout=5
            )
            if duration_check.returncode == 0:
                duration = float(duration_check.stdout.strip())
                logger.info(f"Audio duration: {duration:.2f} seconds")
        except Exception as e:
            logger.warning(f"Could not determine audio duration: {e}")
        
        # Transcribe audio with smaller model for speed
        logger.info(f"Starting transcription (language hint: {language or 'auto-detect'})...")
        result = await run_in_executor(
            transcriber_service.transcribe,
            temp_audio_path,
            "base",  # Use base model for better accuracy
            language  # Pass language hint
        )
        
        if not result or "text" not in result:
            raise HTTPException(status_code=500, detail="Transcription failed - no result")
        
        transcribed_text = result["text"].strip()
        detected_language = result.get("language", "unknown")
        
        logger.info(f"Transcription successful: '{transcribed_text[:100]}...' (language: {detected_language})")
        
        # Clean up temp file
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            logger.info(f"Cleaned up temporary file: {temp_audio_path}")
        
        return TranscriptionResponse(
            text=transcribed_text,
            detected_language=detected_language
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}", exc_info=True)
        
        # Clean up temp file on error
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

