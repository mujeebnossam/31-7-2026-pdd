import { Response } from 'express';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../middleware/auth';

// GET /api/goals
export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await Goal.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'ASC']],
    });
    res.json(goals);
  } catch (err: any) {
    console.error('getGoals error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve goals' });
  }
};

// POST /api/goals
export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, target, targetAmount, current, currentAmount, deadline, targetDate, category, description, icon, color } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Goal name is required' });
      return;
    }

    const rawTarget = target !== undefined ? target : targetAmount;
    if (rawTarget === undefined || rawTarget === null || isNaN(Number(rawTarget))) {
      res.status(400).json({ error: 'A valid target amount is required' });
      return;
    }

    const parsedTarget = parseFloat(rawTarget);
    if (parsedTarget <= 0) {
      res.status(400).json({ error: 'Target amount must be a positive number greater than zero' });
      return;
    }

    const rawCurrent = current !== undefined ? current : currentAmount;
    const parsedCurrent = rawCurrent !== undefined && rawCurrent !== null && !isNaN(Number(rawCurrent))
      ? Math.max(0, parseFloat(rawCurrent))
      : 0;

    const goal = await Goal.create({
      userId: req.userId!,
      name: name.trim(),
      target: parsedTarget,
      current: parsedCurrent,
      deadline: deadline || targetDate || null,
      category: category ? String(category).trim() : 'Savings',
      description: description ? String(description).trim() : '',
      icon: icon || '🎯',
      color: color || '#10b981',
    });

    res.status(201).json(goal);
  } catch (err: any) {
    console.error('createGoal error:', err.message);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

// PUT /api/goals/:id
export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { name, target, targetAmount, current, currentAmount, deadline, targetDate, category, description, icon, color } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Goal name cannot be empty' });
        return;
      }
      goal.name = name.trim();
    }

    const rawTarget = target !== undefined ? target : targetAmount;
    if (rawTarget !== undefined) {
      const parsed = parseFloat(rawTarget);
      if (isNaN(parsed) || parsed <= 0) {
        res.status(400).json({ error: 'Target amount must be greater than zero' });
        return;
      }
      goal.target = parsed;
    }

    const rawCurrent = current !== undefined ? current : currentAmount;
    if (rawCurrent !== undefined) {
      const parsed = parseFloat(rawCurrent);
      if (isNaN(parsed) || parsed < 0) {
        res.status(400).json({ error: 'Current amount cannot be negative' });
        return;
      }
      goal.current = parsed;
    }

    if (deadline !== undefined || targetDate !== undefined) {
      goal.deadline = deadline || targetDate || null;
    }

    if (category !== undefined) goal.category = String(category).trim();
    if (description !== undefined) goal.description = String(description).trim();
    if (icon !== undefined) goal.icon = icon;
    if (color !== undefined) goal.color = color;

    await goal.save();
    res.json(goal);
  } catch (err: any) {
    console.error('updateGoal error:', err.message);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// GET /api/goals/:id
export const getGoalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const current = parseFloat(goal.current as any) || 0;
    const target = parseFloat(goal.target as any) || 1;
    const remaining = Math.max(0, target - current);
    const progress = Math.min(100, Math.round((current / target) * 100));

    res.json({
      ...goal.toJSON(),
      remaining,
      progress,
    });
  } catch (err: any) {
    console.error('getGoalById error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve goal' });
  }
};

// POST /api/goals/:id/contribute
export const contributeToGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type = 'deposit', accountId } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'A valid positive contribution amount is required' });
      return;
    }

    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { Account } = await import('../models/Account');
    const { sequelize } = await import('../config/database');

    const dbTx = await sequelize.transaction();
    try {
      let account;
      if (accountId) {
        account = await Account.findOne({
          where: { id: accountId, userId: req.userId },
          transaction: dbTx,
        });
      }

      const currentVal = parseFloat(goal.current as any) || 0;
      let newVal = currentVal;

      if (type === 'deposit') {
        newVal = currentVal + parsedAmount;
        if (account) {
          const accBal = parseFloat(account.balance as any) || 0;
          await account.update({ balance: Math.round((accBal - parsedAmount) * 100) / 100 }, { transaction: dbTx });
        }
      } else if (type === 'withdrawal') {
        newVal = Math.max(0, currentVal - parsedAmount);
        if (account) {
          const accBal = parseFloat(account.balance as any) || 0;
          await account.update({ balance: Math.round((accBal + parsedAmount) * 100) / 100 }, { transaction: dbTx });
        }
      }

      goal.current = Math.round(newVal * 100) / 100;
      await goal.save({ transaction: dbTx });

      await dbTx.commit();

      res.json({
        message: `Successfully ${type === 'deposit' ? 'contributed to' : 'withdrew from'} goal`,
        goal,
        accountBalanceAfter: account ? account.balance : undefined,
      });
    } catch (txErr: any) {
      await dbTx.rollback();
      throw txErr;
    }
  } catch (err: any) {
    console.error('contributeToGoal error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process goal contribution' });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await goal.destroy();
    res.json({ message: 'Goal deleted successfully' });
  } catch (err: any) {
    console.error('deleteGoal error:', err.message);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

