import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { getApp } from 'firebase-admin/app';

import { LoggingService } from '@base/logging';
import { NOTIFICATION_PLATFORM } from '@modules/notification/constants/notifications.constant';

import { ICreatePayloadData } from '@modules/notification/interfaces/notification.interface';
import { CreateNotificationHistoryDto } from '@modules/notification/dto/notification-history.dto';
import { NotificationHistoryService } from '@modules/notification/services/notification-history.service';

import { FcmToken, FcmTokenService } from '@modules/user';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationHistoryService: NotificationHistoryService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly loggingService: LoggingService,
  ) {}
  private readonly logger = this.loggingService.getLogger(NotificationService.name);

  async send(data: CreateNotificationHistoryDto) {
    const app = getApp();

    const fcmTokens = await this.fcmTokenService.find({
      where: {
        user: {
          id: data.receiverId,
        },
      },
    });
    const payload = this.createPayload(
      {
        title: data.notificationDetail.title,
        body: data.notificationDetail.body,
        bodyWithTag: data.notificationDetail.bodyWithTag,
        ...(data.notificationDetail.relatedDataType &&
          data.notificationDetail.relatedDataId && {
            onClickAction: 'openDetail',
            onClickDetailType: data.notificationDetail.relatedDataType,
            onClickDetailId: data.notificationDetail.relatedDataId,
          }),
      },
      fcmTokens.map((data: FcmToken) => data.token),
      [NOTIFICATION_PLATFORM.WEB, NOTIFICATION_PLATFORM.ANDROID, NOTIFICATION_PLATFORM.IOS],
    );

    try {
      await getMessaging(app).sendMulticast(payload);
      void this.notificationHistoryService.insert(data);
    } catch (err: any) {
      this.logger.warn(err);
      return err?.message;
    }
  }

  private createPayload(
    payloadData: ICreatePayloadData,
    tokens: string[],
    platforms: NOTIFICATION_PLATFORM[],
  ): MulticastMessage {
    const data = _.omit(payloadData, ['title', 'body']);
    const payload: MulticastMessage = {
      notification: {
        title: payloadData.title,
        body: payloadData.body,
      },
      tokens,
    };
    platforms.forEach((platform: NOTIFICATION_PLATFORM) => {
      switch (platform) {
        case NOTIFICATION_PLATFORM.WEB:
          payload.webpush = { data };
          break;
        case NOTIFICATION_PLATFORM.ANDROID:
          payload.android = { data };
          break;
        case NOTIFICATION_PLATFORM.IOS:
          payload.apns = {
            payload: {
              aps: {},
              ...data,
            },
          };
          break;
      }
    });

    return payload;
  }
}
