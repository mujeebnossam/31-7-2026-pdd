import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GoalAttributes {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  category?: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalCreationAttributes extends Optional<GoalAttributes, 'id' | 'current' | 'deadline' | 'category' | 'description' | 'icon' | 'color'> {}

export class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public target!: number;
  public current!: number;
  public deadline!: string;
  public category!: string;
  public description!: string;
  public icon!: string;
  public color!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Goal.init(
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
    target: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('target');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    current: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00,
      get() {
        const val = this.getDataValue('current');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    deadline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Savings',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: '🎯',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#10b981',
    },
  },
  {
    sequelize,
    tableName: 'goals',
  }
);

