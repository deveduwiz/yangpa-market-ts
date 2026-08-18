import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface SaleAttributes {
  id: number;
  productName: string;
  description: string;
  price: number;
  email: string;
  photo: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface SaleCreationAttributes extends Optional<SaleAttributes, 'id'> {}

export class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  declare id: number;
  declare productName: string;
  declare description: string;
  declare price: number;
  declare email: string;
  declare photo: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export const initSale = (sequelize: Sequelize): typeof Sale => {
  Sale.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      photo: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'sale',
      timestamps: true,
      paranoid: true,
    }
  );

  return Sale;
};
