import { Response } from 'express';
import { Bill } from '../models/Bill';
import { AuthRequest } from '../middleware/auth';

// Helper: Calculate next due date safely according to frequency
export const calculateNextDueDate = (baseDateStr?: string, dueDay?: number, frequency: string = 'monthly'): { nextDueDate: string; nextDueDay: number } => {
  const now = new Date();
  let baseDate: Date;

  if (baseDateStr) {
    baseDate = new Date(baseDateStr);
    if (isNaN(baseDate.getTime())) baseDate = new Date();
  } else if (dueDay && dueDay >= 1 && dueDay <= 31) {
    baseDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
  } else {
    baseDate = new Date();
  }

  const freq = frequency.toLowerCase();
  const next = new Date(baseDate);

  if (freq === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (freq === 'quarterly') {
    const targetMonth = next.getMonth() + 3;
    const targetDay = next.getDate();
    next.setMonth(targetMonth, 1);
    const maxDaysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, maxDaysInTargetMonth));
  } else if (freq === 'yearly') {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    // monthly default
    const targetMonth = next.getMonth() + 1;
    const targetDay = next.getDate();
    next.setMonth(targetMonth, 1);
    const maxDaysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(targetDay, maxDaysInTargetMonth));
  }

  const nextDueDate = next.toISOString().split('T')[0];
  const nextDueDay = next.getDate();

  return { nextDueDate, nextDueDay };
};

// Helper: Compute dynamic status based on due date
const resolveBillStatus = (dueDateStr?: string, dueDay?: number, currentStatus?: string): string => {
  if (currentStatus === 'paid') return 'paid';

  let targetDate: Date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dueDateStr) {
    targetDate = new Date(dueDateStr);
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date(today.getFullYear(), today.getMonth(), dueDay || 1);
    }
  } else if (dueDay) {
    targetDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  } else {
    return 'upcoming';
  }

  targetDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
};

// GET /api/bills
export const getBills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bills = await Bill.findAll({
      where: { userId: req.userId },
      order: [['dueDate', 'ASC'], ['dueDay', 'ASC'], ['createdAt', 'ASC']],
    });

    const enriched = bills.map(b => {
      const computedStatus = resolveBillStatus(b.dueDate, b.dueDay, b.status);
      return {
        ...b.toJSON(),
        status: b.status === 'paid' ? 'paid' : computedStatus,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('getBills error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve bills' });
  }
};

// POST /api/bills
export const createBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, title, amount, dueDay, dueDate, category, frequency, recurring, autopay, autoPay, description, icon, color } = req.body;

    const billName = (name || title || '').trim();
    if (billName.length === 0) {
      res.status(400).json({ error: 'Bill name or title is required' });
      return;
    }

    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      res.status(400).json({ error: 'A valid bill amount is required' });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      res.status(400).json({ error: 'Bill amount must be greater than zero' });
      return;
    }

    const cleanFreq = frequency ? String(frequency).toLowerCase().trim() : 'monthly';
    const validFreqs = ['weekly', 'monthly', 'quarterly', 'yearly'];
    const resolvedFreq = validFreqs.includes(cleanFreq) ? cleanFreq : 'monthly';

    let resolvedDueDate = dueDate;
    let resolvedDueDay = dueDay ? parseInt(dueDay, 10) : undefined;

    if (!resolvedDueDate && resolvedDueDay) {
      const now = new Date();
      const yr = now.getFullYear();
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const dy = String(resolvedDueDay).padStart(2, '0');
      resolvedDueDate = `${yr}-${mo}-${dy}`;
    } else if (resolvedDueDate && !resolvedDueDay) {
      const d = new Date(resolvedDueDate);
      if (!isNaN(d.getTime())) {
        resolvedDueDay = d.getDate();
      }
    }

    const bill = await Bill.create({
      userId: req.userId!,
      name: billName,
      amount: parsedAmount,
      dueDay: resolvedDueDay || 1,
      dueDate: resolvedDueDate || new Date().toISOString().split('T')[0],
      category: category ? String(category).trim() : 'Utilities',
      frequency: resolvedFreq,
      status: 'upcoming',
      autopay: Boolean(autopay || autoPay),
      description: description ? String(description).trim() : '',
      icon: icon || '📄',
      color: color || '#6366f1',
    });

    res.status(201).json(bill);
  } catch (err: any) {
    console.error('createBill error:', err.message);
    res.status(500).json({ error: 'Failed to create bill' });
  }
};

// PUT /api/bills/:id
export const updateBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bill = await Bill.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    const { name, amount, dueDay, dueDate, category, frequency, status, autopay, paidDate, description, icon, color } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Bill name cannot be empty' });
        return;
      }
      bill.name = name.trim();
    }

    if (amount !== undefined) {
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        res.status(400).json({ error: 'Bill amount must be greater than zero' });
        return;
      }
      bill.amount = parsed;
    }

    if (dueDay !== undefined) {
      const parsedDay = parseInt(dueDay, 10);
      if (!isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31) {
        bill.dueDay = parsedDay;
      }
    }

    if (dueDate !== undefined) bill.dueDate = dueDate;
    if (category !== undefined) bill.category = String(category).trim();
    if (frequency !== undefined) bill.frequency = String(frequency).toLowerCase().trim();
    if (status !== undefined) bill.status = status;
    if (autopay !== undefined) bill.autopay = Boolean(autopay);
    if (paidDate !== undefined) bill.paidDate = paidDate;
    if (description !== undefined) bill.description = String(description).trim();
    if (icon !== undefined) bill.icon = icon;
    if (color !== undefined) bill.color = color;

    await bill.save();
    res.json(bill);
  } catch (err: any) {
    console.error('updateBill error:', err.message);
    res.status(500).json({ error: 'Failed to update bill' });
  }
};

// POST /api/bills/:id/pay
export const payBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accountId } = req.body;
    const bill = await Bill.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    const { Account } = await import('../models/Account');
    const { Transaction } = await import('../models/Transaction');
    const { sequelize } = await import('../config/database');

    const dbTx = await sequelize.transaction();
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      bill.paidDate = todayStr;

      // Calculate next recurring due date
      const { nextDueDate, nextDueDay } = calculateNextDueDate(bill.dueDate, bill.dueDay, bill.frequency);
      bill.dueDate = nextDueDate;
      bill.dueDay = nextDueDay;
      bill.status = 'paid';

      await bill.save({ transaction: dbTx });

      // If accountId is provided, record transaction and deduct account
      if (accountId) {
        const account = await Account.findOne({
          where: { id: accountId, userId: req.userId },
          transaction: dbTx,
        });

        if (account) {
          const currentBal = parseFloat(account.balance as any) || 0;
          const billAmt = parseFloat(bill.amount as any) || 0;
          await account.update(
            { balance: Math.round((currentBal - billAmt) * 100) / 100 },
            { transaction: dbTx }
          );

          await Transaction.create(
            {
              userId: req.userId!,
              accountId: account.id,
              title: `Bill: ${bill.name}`,
              merchant: bill.name,
              amount: billAmt,
              type: 'expense',
              category: bill.category || 'Utilities',
              date: todayStr,
              icon: bill.icon || '📄',
              notes: `Automated payment for ${bill.name} (${bill.frequency})`,
              source: 'manual',
              status: 'cleared',
            },
            { transaction: dbTx }
          );
        }
      }

      await dbTx.commit();
      res.json({ message: 'Bill marked as paid', bill });
    } catch (txErr: any) {
      await dbTx.rollback();
      throw txErr;
    }
  } catch (err: any) {
    console.error('payBill error:', err.message);
    res.status(500).json({ error: 'Failed to process bill payment' });
  }
};

// DELETE /api/bills/:id
export const deleteBill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bill = await Bill.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }

    await bill.destroy();
    res.json({ message: 'Bill deleted successfully' });
  } catch (err: any) {
    console.error('deleteBill error:', err.message);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
};

