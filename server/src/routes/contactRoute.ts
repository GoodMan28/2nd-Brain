import { Router } from 'express';
import { sendMessage } from '../controllers/contactController.js';

const router = Router();

// POST /api/v1/contact
router.post('/', sendMessage);

export default router;
