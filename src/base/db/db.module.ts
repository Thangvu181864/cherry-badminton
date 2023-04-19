import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { addTransactionalDataSource, deleteDataSourceByName } from 'typeorm-transactional';

import { LoggingService } from '@base/logging';
import { config } from '@config';

import { typeOrmOptionsGenerate } from '@base/db/ormconfig';

const typeOrmOptions: TypeOrmModuleAsyncOptions[] = [
  {
    inject: [LoggingService],
    useFactory: (loggingService: LoggingService) =>
      ({
        ...typeOrmOptionsGenerate(config),
        synchronize: true,
        cache: {
          type: 'redis',
          options: {
            socket: {
              host: config.REDIS_HOST,
              port: config.REDIS_PORT,
            },
            password: config.REDIS_PASSWORD,
            database: config.REDIS_STORAGE.DATABASE,
          },
          duration: config.CACHE_DB_TIMEOUT,
          ignoreErrors: true,
        },
        logging: true,
        logger: config.NODE_ENV === config.JEST ? 'debug' : loggingService.getDbLogger('main_db'),
      } as TypeOrmModuleOptions),
    async dataSourceFactory(options: DataSourceOptions): Promise<DataSource> {
      if (!options) {
        throw new Error('Invalid options passed');
      }
      deleteDataSourceByName('default');
      return addTransactionalDataSource(new DataSource(options));
    },
  },
];

@Module({
  imports: [...typeOrmOptions.map((options) => TypeOrmModule.forRootAsync(options))],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
