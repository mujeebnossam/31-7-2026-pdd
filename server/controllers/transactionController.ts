import { Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { AuthRequest } from '../middleware/auth';

// GET /api/transactions
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, accountId, limit = 100, offset = 0 } = req.query;

    const where: any = { userId: req.userId };
    if (type && (type === 'income' || type === 'expense')) {
      where.type = type;
    }
    if (category && typeof category === 'string' && category.trim() !== 'All') {
      where.category = { [Op.iLike]: `%${category.trim()}%` };
    }
    if (accountId && typeof accountId === 'string') {
      where.accountId = accountId;
    }

    const transactions = await Transaction.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    res.json(transactions);
  } catch (err: any) {
    console.error('getTransactions error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
};

// POST /api/transactions
// Uses Sequelize DB transaction for atomicity — balance update + transaction creation
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const dbTx = await sequelize.transaction();
  try {
    const { title, merchant, amount, type, category, date, icon, notes, accountId } = req.body;

    const itemTitle = (title || merchant || '').trim();
    if (!itemTitle) {
      await dbTx.rollback();
      res.status(400).json({ error: 'Title or merchant is required' });
      return;
    }

    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      await dbTx.rollback();
      res.status(400).json({ error: 'A valid amount is required' });
      return;
    }

    const parsedAmount = Math.abs(parseFloat(amount));
    if (parsedAmount <= 0) {
      await dbTx.rollback();
      res.status(400).json({ error: 'Amount must be greater than zero' });
      return;
    }

    if (!type || !['income', 'expense'].includes(type)) {
      await dbTx.rollback();
      res.status(400).json({ error: 'type must be "income" or "expense"' });
      return;
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      await dbTx.rollback();
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    // Verify account ownership if accountId provided
    if (accountId) {
      const account = await Account.findOne({
        where: { id: accountId, userId: req.userId },
        transaction: dbTx,
        lock: true,
      });

      if (!account) {
        await dbTx.rollback();
        res.status(404).json({ error: 'Account not found or does not belong to you' });
        return;
      }

      // Atomically update balance
      const balanceDelta = type === 'income' ? parsedAmount : -parsedAmount;
      await account.update(
        { balance: parseFloat(account.balance as any) + balanceDelta },
        { transaction: dbTx }
      );
    }

    const tx = await Transaction.create(
      {
        userId: req.userId!,
        accountId: accountId || null,
        title: itemTitle,
        merchant: (merchant || itemTitle).trim(),
        amount: parsedAmount,
        type,
        category: category.trim(),
        date: date || new Date().toISOString().split('T')[0],
        icon: icon || (type === 'income' ? '💰' : '💳'),
        notes: notes ? String(notes).trim() : null,
        status: 'cleared',
      },
      { transaction: dbTx }
    );

    await dbTx.commit();
    res.status(201).json(tx);
  } catch (err: any) {
    await dbTx.rollback();
    console.error('createTransaction error:', err.message);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// PUT /api/transactions/:id
// Atomically reconciles previous and updated balance impacts
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const dbTx = await sequelize.transaction();
  try {
    const tx = await Transaction.findOne({
      where: { id: req.params.id, userId: req.userId },
      transaction: dbTx,
      lock: true,
    });

    if (!tx) {
      await dbTx.rollback();
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    const { title, merchant, amount, type, category, date, icon, notes, accountId, status } = req.body;

    const newType = type || tx.type;
    if (newType && !['income', 'expense'].includes(newType)) {
      await dbTx.rollback();
      res.status(400).json({ error: 'type must be "income" or "expense"' });
      return;
    }

    let newAmount = tx.amount;
    if (amount !== undefined) {
      const parsed = Math.abs(parseFloat(amount));
      if (isNaN(parsed) || parsed <= 0) {
        await dbTx.rollback();
        res.status(400).json({ error: 'Amount must be greater than zero' });
        return;
      }
      newAmount = parsed;
    }

    const oldAccountId = tx.accountId;
    const targetAccountId = accountId !== undefined ? (accountId || null) : oldAccountId;

    // 1. If old account existed, revert old transaction balance impact
    if (oldAccountId) {
      const oldAccount = await Account.findOne({
        where: { id: oldAccountId, userId: req.userId },
        transaction: dbTx,
        lock: true,
      });

      if (oldAccount) {
        const revertDelta = tx.type === 'income' ? -tx.amount : tx.amount;
        await oldAccount.update(
          { balance: parseFloat(oldAccount.balance as any) + revertDelta },
          { transaction: dbTx }
        );
      }
    }

    // 2. If target account exists, apply new transaction balance impact
    if (targetAccountId) {
      const targetAccount = await Account.findOne({
        where: { id: targetAccountId, userId: req.userId },
        transaction: dbTx,
        lock: true,
      });

      if (!targetAccount) {
        await dbTx.rollback();
        res.status(404).json({ error: 'Target account not found or unauthorized' });
        return;
      }

      const applyDelta = newType === 'income' ? newAmount : -newAmount;
      await targetAccount.update(
        { balance: parseFloat(targetAccount.balance as any) + applyDelta },
        { transaction: dbTx }
      );
    }

    // 3. Update transaction record
    if (title !== undefined || merchant !== undefined) {
      const updatedTitle = (title || merchant || tx.title).trim();
      tx.title = updatedTitle;
      tx.merchant = (merchant || updatedTitle).trim();
    }
    tx.amount = newAmount;
    tx.type = newType;
    if (category !== undefined) tx.category = category.trim();
    if (date !== undefined) tx.date = date;
    if (icon !== undefined) tx.icon = icon;
    if (notes !== undefined) tx.notes = notes ? String(notes).trim() : '';
    if (status !== undefined) tx.status = status;
    tx.accountId = targetAccountId;

    await tx.save({ transaction: dbTx });
    await dbTx.commit();

    res.json(tx);
  } catch (err: any) {
    await dbTx.rollback();
    console.error('updateTransaction error:', err.message);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// DELETE /api/transactions/:id
// Reverses the balance impact atomically
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const dbTx = await sequelize.transaction();
  try {
    const tx = await Transaction.findOne({
      where: { id: req.params.id, userId: req.userId },
      transaction: dbTx,
      lock: true,
    });

    if (!tx) {
      await dbTx.rollback();
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Reverse balance impact
    if (tx.accountId) {
      const account = await Account.findOne({
        where: { id: tx.accountId, userId: req.userId },
        transaction: dbTx,
        lock: true,
      });

      if (account) {
        // Reverse: expense adds back, income subtracts
        const reverseDelta = tx.type === 'income' ? -tx.amount : tx.amount;
        await account.update(
          { balance: parseFloat(account.balance as any) + reverseDelta },
          { transaction: dbTx }
        );
      }
    }

    await tx.destroy({ transaction: dbTx });
    await dbTx.commit();
    res.json({ message: 'Transaction deleted and balance reversed successfully' });
  } catch (err: any) {
    await dbTx.rollback();
    console.error('deleteTransaction error:', err.message);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
