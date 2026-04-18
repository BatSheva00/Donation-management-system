import { Router } from "express";
import * as ttsController from "./tts.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/tts - Convert text to speech
router.post("/", ttsController.textToSpeech);

export default router;

