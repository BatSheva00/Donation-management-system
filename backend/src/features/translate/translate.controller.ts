import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/utils/AppError";
import { translate } from "@vitalets/google-translate-api";
import { franc } from "franc";
import axios from "axios";

/**
 * Fallback: MyMemory Translation API (100% free, no API key)
 * With email: 50,000 chars/day
 * Without email: 10,000 chars/day
 */
const translateWithMyMemory = async (
  text: string,
  sourceLang: string,
  targetLang: string
) => {
  try {
    const response = await axios.get(
      "https://api.mymemory.translated.net/get",
      {
        params: {
          q: text,
          langpair: `${sourceLang}|${targetLang}`,
          de: process.env.CONTACT_EMAIL || "da.kolosovski@gmail.com", // Provide email for 50k chars/day
        },
        timeout: 10000,
      }
    );

    if (response.data.responseStatus === 200) {
      return response.data.responseData.translatedText;
    } else {
      throw new Error("MyMemory translation failed");
    }
  } catch (error) {
    throw new Error("MyMemory failed");
  }
};

/**
 * Translate text to opposite language
 * Detects source language and translates to the other:
 * - English → Hebrew
 * - Hebrew → English
 *
 * Uses Google Translate first, falls back to LibreTranslate if Google fails
 */
export const translateText = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new AppError("Text is required", 400));
    }

    // Detect source language using franc
    const detectedLangCode = franc(text, { minLength: 3 });

    // Map franc language codes to our supported languages
    let detectedLanguage = "unknown";
    if (detectedLangCode === "eng") {
      detectedLanguage = "en";
    } else if (detectedLangCode === "heb") {
      detectedLanguage = "he";
    }

    // Determine target language (opposite of detected)
    let targetLanguage: string;
    if (detectedLanguage === "en") {
      targetLanguage = "he"; // English → Hebrew
    } else if (detectedLanguage === "he") {
      targetLanguage = "en"; // Hebrew → English
    } else {
      // If language not detected, default to translating to Hebrew
      targetLanguage = "he";
    }

    // Try Google Translate first (without proxy)
    try {
      const result: any = await translate(text, { to: targetLanguage });

      // Get actual detected language from Google Translate result
      const actualSourceLang = result.from?.language?.iso || detectedLanguage;

      // Double-check: if Google detected the same language as target, flip it
      let finalTargetLang = targetLanguage;
      if (actualSourceLang === targetLanguage) {
        finalTargetLang = actualSourceLang === "en" ? "he" : "en";
        // Re-translate with correct target
        const retryResult: any = await translate(text, { to: finalTargetLang });

        return res.status(200).json({
          success: true,
          data: {
            originalText: text,
            translatedText: retryResult.text,
            sourceLanguage: actualSourceLang,
            targetLanguage: finalTargetLang,
            detectedLanguage: actualSourceLang,
            provider: "google",
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          originalText: text,
          translatedText: result.text,
          sourceLanguage: actualSourceLang,
          targetLanguage: finalTargetLang,
          detectedLanguage: actualSourceLang,
          provider: "google",
        },
      });
    } catch (googleError) {
      // Google Translate failed, try MyMemory fallback
      // Use detected language or default
      const sourceLang =
        detectedLanguage !== "unknown" ? detectedLanguage : "en";

      try {
        const translatedText = await translateWithMyMemory(
          text,
          sourceLang,
          targetLanguage
        );

        return res.status(200).json({
          success: true,
          data: {
            originalText: text,
            translatedText,
            sourceLanguage: sourceLang,
            targetLanguage,
            detectedLanguage: sourceLang,
            provider: "mymemory",
          },
        });
      } catch (myMemoryError) {
        // Both services failed
        return next(
          new AppError(
            "Translation service temporarily unavailable. Please try again later.",
            503
          )
        );
      }
    }
  } catch (error) {
    next(error);
  }
};
