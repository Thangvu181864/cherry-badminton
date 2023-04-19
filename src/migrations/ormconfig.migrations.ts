import { typeOrmOptionsGenerate } from '@base/db/ormconfig';
import { ConfigService } from '@config';

const config = new ConfigService();
export = {
  ...typeOrmOptionsGenerate(config),
  migrations: ['src/migrations/migration/**/*.ts'],
};
