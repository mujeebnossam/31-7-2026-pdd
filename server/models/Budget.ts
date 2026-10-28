import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BudgetAttributes {
  id: string;
  userId: string;
  category: string;
  budgeted: number;
  period?: string;
  color?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BudgetCreationAttributes extends Optional<BudgetAttributes, 'id' | 'period' | 'color' | 'icon'> {}

export class Budget extends Model<BudgetAttributes, BudgetCreationAttributes> implements BudgetAttributes {
  public id!: string;
  public userId!: string;
  public category!: string;
  public budgeted!: number;
  public period!: string;
  public color!: string;
  public icon!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Budget.init(
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    budgeted: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('budgeted');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    period: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'monthly',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3b82f6',
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: '🎯',
    },
  },
  {
    sequelize,
    tableName: 'budgets',
  }
);

