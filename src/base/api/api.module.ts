import { Module } from '@nestjs/common';

import { LoggingModule } from '@base/logging/logging.module';

import { ApiResolver } from '@base/api/api.resolver';

@Module({
  imports: [LoggingModule],
  controllers: [],
  providers: [ApiResolver],
})
export class ApiModule {}
