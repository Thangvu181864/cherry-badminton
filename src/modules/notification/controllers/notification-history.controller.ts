import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { BaseApiController } from '@base/api';
import { LoggingService } from '@base/logging';

import { NotificationHistoryService } from '@modules/notification/services/notification-history.service';
import { QueryDto, ReadIdsDto } from '@modules/notification/dto/notification-history.dto';
import { RequestUser } from '@modules/user';

@ApiTagsAndBearer('Notification History')
@Controller('notification-histories')
export class NotificationHistoryController extends BaseApiController {
  constructor(
    private readonly service: NotificationHistoryService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(NotificationHistoryController.name);

  @ApiOperation({ summary: 'Get all notification histories' })
  @Get()
  async getAll(@Req() req: RequestUser, @Query() query: QueryDto) {
    return this.service.listWithPage({
      ...query,
      filter: { ...query.filter, receiver: req.user.id },
    });
  }

  @ApiOperation({ summary: 'Read notification histories' })
  @Post('read')
  async read(@Req() req: RequestUser, @Body() readIdsDto: ReadIdsDto) {
    return this.service.readNotification(req.user.id, false, readIdsDto.ids);
  }

  @ApiOperation({ summary: 'Read all notification histories' })
  @Post('read-all')
  async readAll(@Req() req: RequestUser) {
    return this.service.readNotification(req.user.id, true);
  }
}
