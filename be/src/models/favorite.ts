import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface FavoriteAttributes {
  id: number;
  /** 찜한 회원. user.email 을 논리적 FK 로 쓰는 기존 규칙을 따른다. */
  email: string;
  saleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteCreationAttributes extends Optional<FavoriteAttributes, 'id'> {}

export class Favorite
  extends Model<FavoriteAttributes, FavoriteCreationAttributes>
  implements FavoriteAttributes
{
  declare id: number;
  declare email: string;
  declare saleId: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export const initFavorite = (sequelize: Sequelize): typeof Favorite => {
  Favorite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'favorite',
      timestamps: true,
      // 찜은 껐다 켰다 하는 토글이라 soft delete 를 쓰면 유니크 제약과 충돌한다.
      paranoid: false,
      indexes: [{ unique: true, fields: ['email', 'saleId'] }],
    }
  );

  return Favorite;
};
