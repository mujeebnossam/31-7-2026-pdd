import { Router } from 'express';
import {
  getProviders,
  parseCSV,
  confirmCSVImport,
  simulateDemo,
} from '../controllers/ingestionController';
import { protect } from '../middleware/auth';

const router = Router();

// Strict JWT protection for all ingestion pipeline routes
router.use(protect);

router.get('/providers', getProviders);
router.post('/csv/parse', parseCSV);
router.post('/csv/confirm', confirmCSVImport);
router.post('/demo', simulateDemo);

export default router;
