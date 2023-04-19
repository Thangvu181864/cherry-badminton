import { In, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';

import { NotificationHistory } from '@modules/notification/entities/notification-history.entity';
import { NotificationHistoryRepository } from '@modules/notification/repositories/notification-history.repository';
import { CreateNotificationHistoryDto } from '@modules/notification/dto/notification-history.dto';
import { NotificationDetailRepository } from '@modules/notification/repositories/notification-detail.repository';

import { UserService } from '@modules/user';

@Injectable()
export class NotificationHistoryService extends BaseCrudService<NotificationHistory> {
  constructor(
    private readonly notificationHistoryRepository: NotificationHistoryRepository,
    private readonly notificationDetailDetailRepository: NotificationDetailRepository,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {
    super(
      NotificationHistory,
      notificationHistoryRepository,
      'notificationHistory',
      loggingService.getLogger(NotificationHistoryService.name),
    );
  }

  async extendFindAllQuery(query: SelectQueryBuilder<NotificationHistory>) {
    return query
      .leftJoinAndSelect('notificationHistory.notificationDetail', 'notificationDetail')
      .leftJoin('notificationHistory.receiver', 'receiver');
  }

  async readNotification(userId: number, isReadAll?: boolean, ids?: number[]) {
    await this.notificationHistoryRepository.update(
      {
        ...(!isReadAll && ids && { id: In(ids) }),
        receiver: {
          id: userId,
        },
      },
      {
        isRead: true,
      },
    );
  }

  async insert(data: CreateNotificationHistoryDto) {
    const notificationDetail = await this.notificationDetailDetailRepository.save(
      data.notificationDetail,
    );
    const receiver = await this.userService.getById(data.receiverId);
    return this.notificationHistoryRepository.save({
      ...data,
      receiver,
      notificationDetail,
    });
  }
}
