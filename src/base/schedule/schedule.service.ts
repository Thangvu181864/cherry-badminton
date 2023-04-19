import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { DateTime } from 'luxon';
import { LoggingService } from '@base/logging';
import { ConfigService } from '@config';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly loggingService: LoggingService,
    private readonly config: ConfigService,
  ) {
    if (!config.SCHEDULE_ENABLE) this.disableSchedule();
  }

  private readonly logger = this.loggingService.getLogger('schedule');

  private disableScheduleFunc = (...args: any[]) => {};

  private disableSchedule() {
    this.addCronJob = this.disableScheduleFunc;
    this.changeTimeCronJob = this.disableScheduleFunc;
    this.deleteCron = this.disableScheduleFunc;
    this.infoCron = this.disableScheduleFunc;
  }

  doesCronExists = (name: string) => this.schedulerRegistry.getCronJob(name);
  doesTimeoutExists = (name: string) => this.schedulerRegistry.getTimeout(name);
  doesIntervalExists = (name: string) => this.schedulerRegistry.getInterval(name);

  addCronJob(name: string, cronTime: string | Date | DateTime, callback: () => void): void {
    const logStr = `${name} at ${cronTime.toString()}!`;
    const job = new CronJob(cronTime, () => {
      this.logger.info('Cron: Starting ' + logStr);
      callback();
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();
    this.logger.info('Cron: Created ' + logStr);
  }

  /**
   * throw if not exist
   */
  changeTimeCronJob(name: string, cronTime: string | Date | DateTime): void {
    const logStr = `${name} at ${cronTime.toString()}!`;
    const job = this._getCron(name);
    job.stop();
    job.setTime(new CronTime(cronTime));
    job.start();
    this.logger.info('Cron: Changed time ' + logStr);
  }

  /**
   * throw if not exist
   */
  deleteCron(name: string): void {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.info(`Cron: Deleted ${name}`);
  }

  /**
   * throw if not exist
   */
  private _getCron(name: string): CronJob {
    const job = this.schedulerRegistry.getCronJob(name);
    let next: string | Date;
    try {
      next = job.nextDates().toJSDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.info(`Cron: ${name} -> next: ${next.toString()}`);
    return job;
  }

  infoCron(name: string): void {
    try {
      this._getCron(name);
    } catch (e) {
      this.logger.warn(e.message);
    }
  }

  addInterval(
    name: string,
    milliseconds: number,
    callback: () => void,
    execOnCreate?: boolean,
  ): void {
    const _callback = () => {
      this.logger.info(`Interval: ${name} executing at time (${milliseconds})!`);
      callback();
    };

    const interval = setInterval(_callback, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
    execOnCreate && _callback();
  }

  /**
   * throw if not exist
   */
  deleteInterval(name: string) {
    this.schedulerRegistry.deleteInterval(name);
    this.logger.info(`Interval: Deleted ${name}!`);
  }

  infoIntervals(): void {
    const intervals = this.schedulerRegistry.getIntervals();
    intervals.forEach((key) => this.logger.info(`Interval: ${key}`));
  }

  addTimeout(name: string, milliseconds: number, callback: () => void): void {
    const _callback = () => {
      this.logger.info(`Timeout: ${name} executing after (${milliseconds})!`);
      callback();
    };

    const timeout = setTimeout(_callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  /**
   * throw if not exist
   */
  deleteTimeout(name: string): void {
    this.schedulerRegistry.deleteTimeout(name);
    this.logger.info(`Timeout: Deleted ${name}!`);
  }

  infoTimeouts(): void {
    const timeouts = this.schedulerRegistry.getTimeouts();
    timeouts.forEach((key) => this.logger.info(`Timeout: ${key}`));
  }
}
