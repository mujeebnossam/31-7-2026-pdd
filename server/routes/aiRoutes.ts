import { Router } from 'express';
import {
  getSummary,
  getInsights,
  getPredictions,
  chat,
  getConversations,
  clearConversations,
  suggestCategory,
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

// Enforce strict authentication on all AI routes
router.use(protect);

router.get('/summary', getSummary);
router.get('/insights', getInsights);
router.get('/predictions', getPredictions);
router.post('/chat', chat);
router.get('/conversations', getConversations);
router.delete('/conversations', clearConversations);
router.post('/suggest-category', suggestCategory);

export default router;
