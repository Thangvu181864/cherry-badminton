import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class MemcachedService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  get = this.cache.get;
  set = this.cache.set;
  del = this.cache.del;
  reset = this.cache.reset;
}
