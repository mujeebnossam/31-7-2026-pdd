import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AIConversationAttributes {
  id: string;
  userId: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIConversationCreationAttributes extends Optional<AIConversationAttributes, 'id' | 'title'> {}

export class AIConversation extends Model<AIConversationAttributes, AIConversationCreationAttributes> implements AIConversationAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIConversation.init(
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
    title: {
      type: DataTypes.STRING,
      defaultValue: 'Financial Advisory Session',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ai_conversations',
  }
);
