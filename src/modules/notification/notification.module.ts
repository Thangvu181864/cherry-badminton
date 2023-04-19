import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationDetail } from '@modules/notification/entities/notification-detail.entity';
import { NotificationHistory } from '@modules/notification/entities/notification-history.entity';
import { NotificationDetailRepository } from '@modules/notification/repositories/notification-detail.repository';
import { NotificationHistoryRepository } from '@modules/notification/repositories/notification-history.repository';
import { NotificationService } from '@modules/notification/services/notification.service';
import { NotificationHistoryController } from '@modules/notification/controllers/notification-history.controller';
import { NotificationController } from '@modules/notification/controllers/notification.controller';
import { NotificationHistoryService } from '@modules/notification/services/notification-history.service';

import { UserModule } from '@modules/user';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      NotificationDetail,
      NotificationDetailRepository,
      NotificationHistory,
      NotificationHistoryRepository,
    ]),
  ],
  controllers: [NotificationHistoryController, NotificationController],
  providers: [
    NotificationService,
    NotificationHistoryService,
    NotificationDetailRepository,
    NotificationHistoryRepository,
  ],
  exports: [
    NotificationService,
    NotificationHistoryService,
    NotificationDetailRepository,
    NotificationHistoryRepository,
  ],
})
export class NotificationModule {}
