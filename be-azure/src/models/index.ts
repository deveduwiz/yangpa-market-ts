import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import { initUser, User } from './user.js';
import { initSale, Sale } from './sale.js';
import { initFavorite, Favorite } from './favorite.js';

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    define: {
      timestamps: true,
      paranoid: true,
    },
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

initUser(sequelize);
initSale(sequelize);
initFavorite(sequelize);

User.hasMany(Sale, { foreignKey: 'email', sourceKey: 'email' });
Sale.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

// 찜. sale.id 를 FK 로 쓰고, 회원 쪽은 기존 규칙대로 email 을 쓴다.
Sale.hasMany(Favorite, { foreignKey: 'saleId', sourceKey: 'id' });
Favorite.belongsTo(Sale, { foreignKey: 'saleId', targetKey: 'id' });
User.hasMany(Favorite, { foreignKey: 'email', sourceKey: 'email' });
Favorite.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

export { sequelize, User, Sale, Favorite };
