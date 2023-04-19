/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    │
 * │    │    │    │    │    └ Day in week (0 - 7) (0 or 7 is Sunday)
 * │    │    │    │    └───── Month (1 - 12)
 * │    │    │    └────────── Day in month (1 - 31)
 * │    │    └─────────────── Hour (0 - 23)
 * │    └──────────────────── Minutes (0 - 59)
 * └───────────────────────── Second (0 - 59, OPTIONAL)
 */
import { Global, Module } from '@nestjs/common';
import { ScheduleService } from '@base/schedule/schedule.service';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [NestScheduleModule.forRoot()],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
