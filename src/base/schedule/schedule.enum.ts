import { CronExpression } from '@nestjs/schedule';

export { CronExpression } from '@nestjs/schedule';

export enum ScheduleTypeEnum {
  Cron = 'cron',
  Timeout = 'timeout',
  Interval = 'interval',
}

export const CronExpressionExtends = Object.assign(
  {
    EVERY_15_SECONDS: '*/15 * * * * *',
  },
  CronExpression,
);
