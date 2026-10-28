import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionAttributes {
  id: string;
  userId: string;
  accountId?: string | null;
  title: string;
  merchant?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon?: string;
  status?: string;
  notes?: string;
  source?: 'manual' | 'csv' | 'bank' | 'upi' | 'demo' | string;
  externalTransactionId?: string | null;
  importedAt?: Date | null;
  rawDescription?: string | null;
  confidence?: number | null;
  ingestionStatus?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionCreationAttributes extends Optional<
  TransactionAttributes,
  'id' | 'accountId' | 'merchant' | 'icon' | 'status' | 'notes' | 'source' | 'externalTransactionId' | 'importedAt' | 'rawDescription' | 'confidence' | 'ingestionStatus'
> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: string;
  public userId!: string;
  public accountId!: string | null;
  public title!: string;
  public merchant!: string;
  public amount!: number;
  public type!: 'income' | 'expense';
  public category!: string;
  public date!: string;
  public icon!: string;
  public status!: string;
  public notes!: string;
  public source!: 'manual' | 'csv' | 'bank' | 'upi' | 'demo' | string;
  public externalTransactionId!: string | null;
  public importedAt!: Date | null;
  public rawDescription!: string | null;
  public confidence!: number | null;
  public ingestionStatus!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    merchant: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('amount');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: '💳',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'cleared',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'manual',
    },
    externalTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    importedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rawDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 1.0,
    },
    ingestionStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'processed',
    },
  },
  {
    sequelize,
    tableName: 'transactions',
  }
);
