import { Response } from 'express';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { sequelize } from '../config/database';

// GET /api/accounts
export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accounts = await Account.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'ASC']],
    });
    res.json(accounts);
  } catch (err: any) {
    console.error('getAccounts error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve accounts' });
  }
};

// GET /api/accounts/:id
export const getAccountById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json(account);
  } catch (err: any) {
    console.error('getAccountById error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve account' });
  }
};

// POST /api/accounts
export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, balance, bank, last4, color } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Account name is required' });
      return;
    }

    const parsedBalance = balance !== undefined && balance !== null && !isNaN(Number(balance))
      ? parseFloat(balance)
      : 0;

    const account = await Account.create({
      userId: req.userId!,
      name: name.trim(),
      type: type || 'checking',
      balance: parsedBalance,
      bank: bank ? String(bank).trim() : 'Bank',
      last4: last4 ? String(last4).slice(-4) : '0000',
      color: color || '#3b82f6',
    });

    res.status(201).json(account);
  } catch (err: any) {
    console.error('createAccount error:', err.message);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// PUT /api/accounts/:id
export const updateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const { name, type, balance, bank, last4, color } = req.body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Account name cannot be empty' });
        return;
      }
      account.name = name.trim();
    }

    if (type !== undefined) account.type = type;
    if (balance !== undefined && !isNaN(Number(balance))) account.balance = parseFloat(balance);
    if (bank !== undefined) account.bank = String(bank).trim();
    if (last4 !== undefined) account.last4 = String(last4).slice(-4);
    if (color !== undefined) account.color = color;

    await account.save();
    res.json(account);
  } catch (err: any) {
    console.error('updateAccount error:', err.message);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// DELETE /api/accounts/:id
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const dbTx = await sequelize.transaction();
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, userId: req.userId },
      transaction: dbTx,
      lock: true,
    });

    if (!account) {
      await dbTx.rollback();
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    // Unlink transactions referencing this account so foreign key constraint is satisfied safely
    await Transaction.update(
      { accountId: null },
      { where: { accountId: account.id, userId: req.userId }, transaction: dbTx }
    );

    await account.destroy({ transaction: dbTx });
    await dbTx.commit();
    res.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    await dbTx.rollback();
    console.error('deleteAccount error:', err.message);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
