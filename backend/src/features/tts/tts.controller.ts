import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { AppError } from "../../shared/utils/AppError";

const AI_MICROSERVICE_URL =
  process.env.AI_MICROSERVICE_URL || "http://localhost:8000";

/**
 * Convert text to speech using AI microservice
 * Returns audio file stream
 */
export const textToSpeech = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new AppError("Text is required", 400));
    }

    // Call AI microservice to generate speech
    const ttsResponse = await axios.post(
      `${AI_MICROSERVICE_URL}/api/text-to-speech`,
      {
        text,
        detect_language: true, // Auto-detect Hebrew/English
      },
      {
        timeout: 30000, // 30 second timeout
      }
    );

    const { audio_url, detected_language } = ttsResponse.data;

    // Download the audio file from AI microservice
    const audioResponse = await axios.get(
      `${AI_MICROSERVICE_URL}${audio_url}`,
      {
        responseType: "arraybuffer",
        timeout: 10000,
      }
    );

    // Set appropriate headers
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=speech.mp3");
    res.setHeader("X-Detected-Language", detected_language || "unknown");

    // Send audio data
    res.send(Buffer.from(audioResponse.data));
  } catch (error: any) {
    console.error("TTS Error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return next(new AppError("AI service is unavailable", 503));
    }

    if (error.response?.status === 500) {
      return next(new AppError("Failed to generate speech", 500));
    }

    return next(new AppError("Text-to-speech service failed", 500));
  }
};
