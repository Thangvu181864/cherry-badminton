import { DataSource, DataSourceOptions, DatabaseType } from 'typeorm';

import * as dotenv from 'dotenv';

dotenv.config();
const configuration = {
  type: (process.env.DB_TYPE ?? 'postgres') as DatabaseType,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const dataSourceOptions = {
  type: 'postgres' as DatabaseType,
  host: configuration.host,
  port: configuration.port,
  username: configuration.username,
  password: configuration.password,
  database: configuration.database,
  entities: ['src/**/*.entity.{ts,js}'],
  logging: true,
  migrations: ['src/migrations/migration/**/*.{ts,js}'],
  autoLoadEntities: true,
} as DataSourceOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
