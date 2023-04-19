import { CacheModule, Global, Module } from '@nestjs/common';
import { MemcachedService } from '@base/db/cache/memcached.service';

const MISSING_CACHE_PROPERTY = `
Missing cache property. Please add

import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

  constructor(
    ...
    @Inject(CACHE_MANAGER) private cache: Cache
    ...
  ) {}

to your class.
`;

@Global()
@Module({
  imports: [CacheModule.register({ ttl: 0 })],
  providers: [MemcachedService],
  exports: [MemcachedService],
})
export class MemcachedModule {}
