import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth.middleware';
import * as translateController from './translate.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/translate - Translate text
router.post('/', translateController.translateText);

export default router;




