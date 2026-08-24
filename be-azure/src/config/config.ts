import dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  dialect: Dialect;
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}

interface BcryptConfig {
  saltRounds: number;
}

interface AzureStorageConfig {
  connectionString: string;
  containerName: string;
}

interface Config {
  db: DbConfig;
  jwt: JwtConfig;
  bcrypt: BcryptConfig;
  azure: AzureStorageConfig;
}

const config: Config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yangpa',
    dialect: (process.env.DIALECT || 'postgres') as Dialect,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: '1d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
  },
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'images',
  },
};

export default config;
