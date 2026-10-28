import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AIMessageAttributes {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIMessageCreationAttributes extends Optional<AIMessageAttributes, 'id'> {}

export class AIMessage extends Model<AIMessageAttributes, AIMessageCreationAttributes> implements AIMessageAttributes {
  public id!: string;
  public conversationId!: string;
  public userId!: string;
  public role!: 'user' | 'assistant' | 'system';
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant', 'system']],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_messages',
  }
);
