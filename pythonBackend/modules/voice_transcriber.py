"""
Voice Transcriber - Whisper-based speech-to-text
Transcribes audio recordings to text (supports 90+ languages)
"""

import whisper
import os


class VoiceTranscriber:
    def __init__(self):
        self.models = {}  # Cache loaded models

    def load_model(self, model_size="base"):
        """
        Load Whisper model (downloads on first use)

        Args:
            model_size: Model variant
                - tiny: ~75MB (fastest, less accurate)
                - base: ~150MB (good balance)
                - small: ~500MB (better accuracy)
                - medium: ~1.5GB (best accuracy)
                - large: ~3GB (best, but slow on CPU)
        """
        if model_size not in self.models:
            print(f"Loading Whisper {model_size} model...")
            print("(First run will download the model, please wait...)")
            self.models[model_size] = whisper.load_model(model_size)
            print("✓ Model loaded successfully")

        return self.models[model_size]

    def transcribe(self, audio_path: str, model_size="base", language=None) -> dict:
        """
        Transcribe audio file to text

        Args:
            audio_path: Path to audio file (.mp3, .wav, .m4a, etc.)
            model_size: Whisper model size (tiny/base/small/medium)
            language: Language code ('en', 'he', 'es', etc.) or None for auto-detect

        Returns:
            Dictionary with transcription results:
            {
                'text': 'Full transcription text',
                'language': 'detected language code',
                'segments': [timestamped segments]
            }
        """
        # Validate file exists
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # Load model
        model = self.load_model(model_size)

        # Transcribe
        print(f"Transcribing audio (language: {language or 'auto-detect'})...")

        if language:
            result = model.transcribe(audio_path, language=language, task="transcribe")
        else:
            result = model.transcribe(audio_path, task="transcribe")

        print("✓ Transcription complete")

        return {
            "text": result["text"].strip(),
            "language": result.get("language", "unknown"),
            "segments": result.get("segments", []),
        }

    def translate_to_english(self, audio_path: str, model_size="base") -> dict:
        """
        Transcribe non-English audio and translate to English

        Args:
            audio_path: Path to audio file
            model_size: Whisper model size

        Returns:
            Dictionary with transcription and translation
        """
        model = self.load_model(model_size)

        print("Transcribing and translating to English...")
        result = model.transcribe(audio_path, task="translate")

        return {
            "original_language": result.get("language", "unknown"),
            "english_translation": result["text"].strip(),
        }

    def extract_driver_report(self, audio_path: str, model_size="base") -> dict:
        """
        Transcribe driver voice report and extract structured info

        Useful for drivers reporting issues while driving

        Args:
            audio_path: Path to audio file
            model_size: Whisper model size

        Returns:
            Dictionary with transcription and extracted data
        """
        # Transcribe
        result = self.transcribe(audio_path, model_size)
        text = result["text"]

        # Basic keyword extraction
        status_keywords = {
            "delivered": ["delivered", "complete", "done", "finished"],
            "issue": ["problem", "issue", "can't", "cannot", "stuck", "delayed"],
            "cancelled": ["cancel", "cancelled", "abort"],
        }

        detected_status = "unknown"
        for status, keywords in status_keywords.items():
            if any(keyword in text.lower() for keyword in keywords):
                detected_status = status
                break

        # Detect severity (basic)
        severity = "low"
        if any(word in text.lower() for word in ["urgent", "emergency", "critical", "serious"]):
            severity = "high"
        elif any(word in text.lower() for word in ["problem", "issue", "delay"]):
            severity = "medium"

        return {
            "transcription": text,
            "detected_status": detected_status,
            "severity": severity,
            "language": result["language"],
        }

    def get_supported_languages(self) -> list:
        """
        Get list of languages supported by Whisper

        Returns:
            List of language codes and names
        """
        return [
            ("en", "English"),
            ("he", "Hebrew"),
            ("es", "Spanish"),
            ("fr", "French"),
            ("de", "German"),
            ("it", "Italian"),
            ("pt", "Portuguese"),
            ("ru", "Russian"),
            ("ar", "Arabic"),
            ("ja", "Japanese"),
            ("ko", "Korean"),
            ("zh", "Chinese"),
            # ... Whisper supports 90+ languages total
        ]

    def batch_transcribe(self, audio_files: list, model_size="base") -> list:
        """
        Transcribe multiple audio files

        Args:
            audio_files: List of audio file paths
            model_size: Whisper model size

        Returns:
            List of transcription results
        """
        model = self.load_model(model_size)
        results = []

        for i, audio_path in enumerate(audio_files, 1):
            print(f"Transcribing {i}/{len(audio_files)}: {os.path.basename(audio_path)}")

            try:
                result = self.transcribe(audio_path, model_size)
                results.append({"file": audio_path, "success": True, "data": result})
            except Exception as e:
                results.append({"file": audio_path, "success": False, "error": str(e)})

        return results

