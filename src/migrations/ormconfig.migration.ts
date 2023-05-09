import { DataSource, DataSourceOptions, DatabaseType } from 'typeorm';

import * as dotenv from 'dotenv';

import { changeStatusMatch1683647238459 } from './migration/1683647238459-change-status-match';

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
  migrations: [changeStatusMatch1683647238459],
  autoLoadEntities: true,
} as DataSourceOptions;

export const AppDataSource = new DataSource(dataSourceOptions);
