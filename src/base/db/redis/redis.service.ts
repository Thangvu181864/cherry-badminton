import { Injectable } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import * as cacheManager from 'cache-manager';

import { LoggingService } from '@base/logging';
import { ConfigService } from '@config';

@Injectable()
export class RedisService {
  readonly logger = new LoggingService().getLogger(RedisService.name);

  constructor(private readonly config: ConfigService, private readonly logging: LoggingService) {}

  private createClient(database: number, ttl: number = this.config.CACHE_TIMEOUT) {
    const redisCache = cacheManager.caching({
      store: redisStore,
      host: this.config.REDIS_HOST,
      port: this.config.REDIS_PORT,
      password: this.config.REDIS_PASSWORD,
      db: database,
      ttl: ttl / 1000,
    });
    const redisClient = redisCache.store.getClient();
    redisClient.on('error', (error) => {
      this.logger.error(error);
    });
    return redisCache;
  }

  global(): cacheManager.Cache {
    return this.createClient(this.config.REDIS_STORAGE.GLOBAL);
  }

  setting(): cacheManager.Cache {
    return this.createClient(this.config.REDIS_STORAGE.SETTING, 0);
  }

  auth(): cacheManager.Cache {
    return this.createClient(this.config.REDIS_STORAGE.AUTH, 0);
  }
}
