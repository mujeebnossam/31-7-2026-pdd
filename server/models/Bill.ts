import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BillAttributes {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDay?: number;
  dueDate?: string;
  category: string;
  frequency?: string;
  status?: string;
  autopay?: boolean;
  paidDate?: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BillCreationAttributes extends Optional<
  BillAttributes,
  'id' | 'dueDay' | 'dueDate' | 'frequency' | 'status' | 'autopay' | 'paidDate' | 'description' | 'icon' | 'color'
> {}

export class Bill extends Model<BillAttributes, BillCreationAttributes> implements BillAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public amount!: number;
  public dueDay!: number;
  public dueDate!: string;
  public category!: string;
  public frequency!: string;
  public status!: string;
  public autopay!: boolean;
  public paidDate!: string;
  public description!: string;
  public icon!: string;
  public color!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bill.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('amount');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    dueDay: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 31 },
    },
    dueDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Utilities',
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'monthly',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'upcoming',
    },
    autopay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paidDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: '📄',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#6366f1',
    },
  },
  {
    sequelize,
    tableName: 'bills',
  }
);

