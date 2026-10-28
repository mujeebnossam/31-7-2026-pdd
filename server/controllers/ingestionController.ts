import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { IngestionService } from '../services/ingestionService';

// GET /api/ingestion/providers
export const getProviders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const providers = IngestionService.getProviders();
    res.json(providers);
  } catch (err: any) {
    console.error('getProviders error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve data providers' });
  }
};

// POST /api/ingestion/csv/parse
export const parseCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { csvContent, accountId } = req.body;

    if (!csvContent || typeof csvContent !== 'string' || csvContent.trim().length === 0) {
      res.status(400).json({ error: 'Valid CSV text content is required' });
      return;
    }

    const result = await IngestionService.parseCSV(req.userId!, csvContent, accountId);
    res.json(result);
  } catch (err: any) {
    console.error('parseCSV error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to parse CSV file' });
  }
};

// POST /api/ingestion/csv/confirm
export const confirmCSVImport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactions, accountId, skipDuplicates = true } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({ error: 'An array of transactions to import is required' });
      return;
    }

    if (!accountId || typeof accountId !== 'string') {
      res.status(400).json({ error: 'Target account ID is required' });
      return;
    }

    const result = await IngestionService.confirmBatchImport(
      req.userId!,
      transactions,
      accountId,
      Boolean(skipDuplicates)
    );

    res.status(201).json(result);
  } catch (err: any) {
    console.error('confirmCSVImport error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to import transactions' });
  }
};

// POST /api/ingestion/demo
export const simulateDemo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await IngestionService.simulateDemoIngestion(req.userId!, req.body || {});
    res.status(201).json(result);
  } catch (err: any) {
    console.error('simulateDemo error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to simulate automated transaction' });
  }
};
