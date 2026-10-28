// Models index — registers all associations and exports everything
import { sequelize } from '../config/database';
import { User } from './User';
import { Account } from './Account';
import { Transaction } from './Transaction';
import { Budget } from './Budget';
import { Goal } from './Goal';
import { Bill } from './Bill';
import { AIConversation } from './AIConversation';
import { AIMessage } from './AIMessage';

// ─── Associations ────────────────────────────────────────────────────────────

// User → Accounts
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts', onDelete: 'CASCADE' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Transactions
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Account → Transactions
Account.hasMany(Transaction, { foreignKey: 'accountId', as: 'transactions', onDelete: 'SET NULL' });
Transaction.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });

// User → Budgets
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Goals
User.hasMany(Goal, { foreignKey: 'userId', as: 'goals', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → Bills
User.hasMany(Bill, { foreignKey: 'userId', as: 'bills', onDelete: 'CASCADE' });
Bill.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User → AI Conversations
User.hasMany(AIConversation, { foreignKey: 'userId', as: 'aiConversations', onDelete: 'CASCADE' });
AIConversation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// AIConversation → AIMessages
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId', as: 'conversation' });

// ─── Exports ─────────────────────────────────────────────────────────────────
export { sequelize, User, Account, Transaction, Budget, Goal, Bill, AIConversation, AIMessage };
