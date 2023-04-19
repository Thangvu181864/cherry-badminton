import { Controller } from '@nestjs/common';

import { ApiTagsAndBearer } from '@base/docs';
import { BaseApiController } from '@base/api';
import { LoggingService } from '@base/logging';

import { NotificationService } from '@modules/notification/services/notification.service';

@ApiTagsAndBearer('Notification')
@Controller('notification')
export class NotificationController extends BaseApiController {
  constructor(
    private readonly service: NotificationService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(NotificationController.name);
}
