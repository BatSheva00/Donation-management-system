"""
Cleanup utilities for temporary files
"""

import logging
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)


def cleanup_temp_files():
    """Clean up old temporary files"""
    temp_dir = Path(settings.TEMP_DIR)
    
    # Create temp directory if it doesn't exist
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Clean old audio files
    cleaned = 0
    for file in temp_dir.glob("tts_*.mp3"):
        try:
            file.unlink()
            cleaned += 1
        except Exception as e:
            logger.error(f"Failed to delete {file}: {e}")
    
    if cleaned > 0:
        logger.info(f"Cleaned up {cleaned} temporary audio files")

