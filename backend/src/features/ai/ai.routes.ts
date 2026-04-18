import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middleware/auth.middleware';
import * as aiController from './ai.controller';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

router.use(authenticate); // All AI routes require authentication

// Generate description from title
router.post('/generate-description', aiController.generateDescription);

// Transcribe audio to text
router.post('/transcribe', upload.single('audio'), aiController.transcribeAudio);

export default router;

