import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../config/logger';

const AI_MICROSERVICE_URL =
  process.env.AI_MICROSERVICE_URL || "http://localhost:8000";

export const generateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, category } = req.body;

    if (!title) {
      return next(
        new AppError("Title is required for description generation", 400)
      );
    }

    logger.info(
      `Generating description for title: ${title}, category: ${category}`
    );

    const aiResponse = await axios.post(
      `${AI_MICROSERVICE_URL}/api/generate-description`,
      {
        title,
        category: category || "general",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      }
    );

    res.json({
      success: true,
      data: {
        description: aiResponse.data.description,
        detectedLanguage: aiResponse.data.detected_language,
      },
    });
  } catch (error: any) {
    logger.error(`Description Generation Error: ${error.message}`);
    if (error.response) {
      logger.error(
        `AI Microservice Response Error: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`
      );
    }
    return next(new AppError("Failed to generate description", 500));
  }
};

export const transcribeAudio = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new AppError("Audio file is required", 400));
    }

    logger.info(
      `Transcribing audio file: ${req.file.originalname}, size: ${req.file.size} bytes`
    );

    // Create form data to send to AI microservice
    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const aiResponse = await axios.post(
      `${AI_MICROSERVICE_URL}/api/transcribe`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout for audio processing
      }
    );

    res.json({
      success: true,
      data: {
        text: aiResponse.data.text,
        detectedLanguage: aiResponse.data.detected_language,
      },
    });
  } catch (error: any) {
    logger.error(`Audio Transcription Error: ${error.message}`);
    if (error.response) {
      logger.error(
        `AI Microservice Transcription Response Error: ${
          error.response.status
        } - ${JSON.stringify(error.response.data)}`
      );
    }
    return next(new AppError("Failed to transcribe audio", 500));
  }
};
