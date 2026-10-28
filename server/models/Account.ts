import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AccountAttributes {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  bank: string;
  last4: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountCreationAttributes extends Optional<AccountAttributes, 'id' | 'balance' | 'bank' | 'last4' | 'color'> {}

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public type!: string;
  public balance!: number;
  public bank!: string;
  public last4!: string;
  public color!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'checking',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      get() {
        const val = this.getDataValue('balance');
        return val === null ? 0 : parseFloat(val as any);
      },
    },
    bank: {
      type: DataTypes.STRING,
      defaultValue: 'Bank',
    },
    last4: {
      type: DataTypes.STRING,
      defaultValue: '0000',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3b82f6',
    },
  },
  {
    sequelize,
    tableName: 'accounts',
  }
);
