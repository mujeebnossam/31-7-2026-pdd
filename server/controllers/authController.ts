import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { Goal } from '../models/Goal';
import { Bill } from '../models/Bill';
import { AIConversation } from '../models/AIConversation';
import { AIMessage } from '../models/AIMessage';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      financialScore: 750,
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        financialScore: user.financialScore,
        memberSince: user.createdAt?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (err: any) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        financialScore: user.financialScore,
        memberSince: user.createdAt?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'name', 'email', 'financialScore', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      financialScore: user.financialScore,
      memberSince: user.createdAt?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
  } catch (err: any) {
    console.error('GetMe error:', err.message);
    res.status(500).json({ error: 'Could not retrieve profile' });
  }
};

// DELETE /api/auth/account
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Managed Sequelize transaction ensuring complete rollback if any delete step fails
    await sequelize.transaction(async (t) => {
      // 1. Delete all user-associated records
      await Transaction.destroy({ where: { userId }, transaction: t });
      await Account.destroy({ where: { userId }, transaction: t });
      await Budget.destroy({ where: { userId }, transaction: t });
      await Goal.destroy({ where: { userId }, transaction: t });
      await Bill.destroy({ where: { userId }, transaction: t });
      await AIMessage.destroy({ where: { userId }, transaction: t });
      await AIConversation.destroy({ where: { userId }, transaction: t });

      // 2. Delete the user record
      const deletedCount = await User.destroy({ where: { id: userId }, transaction: t });
      if (deletedCount === 0) {
        throw new Error('User not found');
      }
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('Delete account error:', err.message);
    if (err.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
