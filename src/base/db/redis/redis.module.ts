import { ConfigModule } from '@config';
import { Global, Module } from '@nestjs/common';
import { RedisService } from '@base/db/redis/redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
