import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmOptionsGenerate = (config) =>
  ({
    type: config.DB_TYPE,
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    timezone: config.DB_TIMEZONE,
    synchronize: false,
    idleTimeoutMillis: 0,
    connectTimeoutMS: 0,
    extra: {
      connectionLimit: 10,
    },
    autoLoadEntities: true,
    cli: { migrationsDir: 'src/migrations/migration/' },
    useNewUrlParser: true,
  } as TypeOrmModuleOptions);
