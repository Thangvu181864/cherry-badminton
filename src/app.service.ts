import { Injectable, OnModuleInit } from '@nestjs/common';
import { unlinkSync, readdirSync } from 'fs';

import { LoggingService } from '@base/logging';
import { ConfigService } from '@config';
import { CronExpressionExtends, ScheduleService } from '@base/schedule';

import { BadmintonSessionService } from '@modules/badminton-session';
import { UserService } from '@modules/user';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly userSerivce: UserService,
    private readonly badmintonSessionService: BadmintonSessionService,
    private readonly configService: ConfigService,
    private readonly scheduleService: ScheduleService,
    private readonly loggingService: LoggingService,
  ) {}

  async onModuleInit() {
    this.scheduleService.addCronJob(
      'RemoveFileNotUsed',
      CronExpressionExtends.EVERY_DAY_AT_MIDNIGHT,
      () => {
        void this.removeFileNotUsed();
      },
    );
  }

  private async removeFileNotUsed() {
    let filePaths = [];
    const avatarPaths = await this.userSerivce.getAvatarPaths();
    const covertImagePaths = await this.badmintonSessionService.getCoverImagePaths();
    filePaths = filePaths.concat(avatarPaths);
    filePaths = filePaths.concat(covertImagePaths);
    const files = readdirSync(this.configService.UPLOAD_PATH);
    const removeFiles = files.filter((file) => !filePaths.includes(file));
    removeFiles.forEach((file) => {
      unlinkSync(`${this.configService.UPLOAD_PATH}/${file}`);
    });
  }
}
