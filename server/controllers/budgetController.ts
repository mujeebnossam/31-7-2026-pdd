import { Response } from 'express';
import { fn, col, literal, Op } from 'sequelize';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

// Helper: Calculate total expense spending per category for a specific month from real PostgreSQL transactions
const calcSpent = async (userId: string, category: string, monthKey?: string): Promise<number> => {
  const currentMonth = (typeof monthKey === 'string' && monthKey.length === 7)
    ? monthKey
    : new Date().toISOString().slice(0, 7); // 'YYYY-MM'

  const result = await Transaction.findOne({
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), literal('0')), 'totalSpent']],
    where: {
      userId,
      category: { [Op.iLike]: category.trim() },
      type: 'expense',
      date: {
        [Op.gte]: `${currentMonth}-01`,
        [Op.lte]: `${currentMonth}-31`,
      },
    },
    raw: true,
  }) as any;

  return Math.abs(parseFloat(result?.totalSpent || '0'));
};

// GET /api/budgets
export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month } = req.query;
    const targetMonth = (typeof month === 'string' && month.length === 7)
      ? month
      : new Date().toISOString().slice(0, 7);

    const budgets = await Budget.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'ASC']],
    });

    // Dynamically calculate spent from real transactions for each budget
    const enriched = await Promise.all(
      budgets.map(async (b) => {
        const spent = await calcSpent(req.userId!, b.category, targetMonth);
        return {
          id: b.id,
          category: b.category,
          budgeted: b.budgeted,
          spent,
          period: b.period || targetMonth,
          color: b.color,
          icon: b.icon,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      })
    );

    res.json(enriched);
  } catch (err: any) {
    console.error('getBudgets error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve budgets' });
  }
};

// POST /api/budgets
export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, budgeted, color, icon, period } = req.body;

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    if (budgeted === undefined || budgeted === null || isNaN(Number(budgeted))) {
      res.status(400).json({ error: 'A valid budget amount is required' });
      return;
    }

    const parsedAmount = parseFloat(budgeted);
    if (parsedAmount <= 0) {
      res.status(400).json({ error: 'Budget amount must be a positive number greater than zero' });
      return;
    }

    const cleanCategory = category.trim();

    // Prevent duplicate category budget per user (case-insensitive)
    const existing = await Budget.findOne({
      where: {
        userId: req.userId,
        category: { [Op.iLike]: cleanCategory },
      },
    });

    if (existing) {
      res.status(409).json({ error: `A budget for "${cleanCategory}" already exists. Update it instead.` });
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const budget = await Budget.create({
      userId: req.userId!,
      category: cleanCategory,
      budgeted: parsedAmount,
      period: period || currentMonth,
      color: color || '#3b82f6',
      icon: icon || '🎯',
    });

    const spent = await calcSpent(req.userId!, cleanCategory, budget.period || currentMonth);
    res.status(201).json({ ...budget.toJSON(), spent });
  } catch (err: any) {
    console.error('createBudget error:', err.message);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

// PUT /api/budgets/:id
export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    const { category, budgeted, color, icon, period } = req.body;

    if (budgeted !== undefined) {
      const parsed = parseFloat(budgeted);
      if (isNaN(parsed) || parsed <= 0) {
        res.status(400).json({ error: 'Budget amount must be greater than zero' });
        return;
      }
      budget.budgeted = parsed;
    }

    if (category !== undefined) {
      const cleanCategory = String(category).trim();
      if (cleanCategory.length === 0) {
        res.status(400).json({ error: 'Category cannot be empty' });
        return;
      }

      // Check if new category clashes with another budget of this user
      if (cleanCategory.toLowerCase() !== budget.category.toLowerCase()) {
        const clash = await Budget.findOne({
          where: {
            userId: req.userId,
            category: { [Op.iLike]: cleanCategory },
            id: { [Op.ne]: budget.id },
          },
        });
        if (clash) {
          res.status(409).json({ error: `A budget for "${cleanCategory}" already exists.` });
          return;
        }
      }
      budget.category = cleanCategory;
    }

    if (color !== undefined) budget.color = color;
    if (icon !== undefined) budget.icon = icon;
    if (period !== undefined) budget.period = period;

    await budget.save();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const spent = await calcSpent(req.userId!, budget.category, budget.period || currentMonth);
    res.json({ ...budget.toJSON(), spent });
  } catch (err: any) {
    console.error('updateBudget error:', err.message);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

// DELETE /api/budgets/:id
export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const budget = await Budget.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!budget) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }

    await budget.destroy();
    res.json({ message: 'Budget deleted successfully' });
  } catch (err: any) {
    console.error('deleteBudget error:', err.message);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

