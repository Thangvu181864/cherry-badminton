import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { LoggingService } from '@base/logging';
import { ApiCreateOperation, ApiTags } from '@base/docs';
import { config } from '@config';

import { SkipAuth } from '@modules/auth/decorators/jwt.decorator';

@ApiTags('Health check')
@SkipAuth()
@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memoryHealthIndicator: MemoryHealthIndicator,
    private diskHealthIndicator: DiskHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private loggingService: LoggingService,
  ) {}

  logger = new LoggingService().getLogger(HealthController.name);

  @Get()
  @ApiCreateOperation({
    summary: 'Health check',
  })
  @HealthCheck()
  checkHealth() {
    return this.healthCheckService.check([
      () => this.db.pingCheck(config.DB_TYPE),
      () => this.http.pingCheck('server', config.HOST),
    ]);
  }
}
