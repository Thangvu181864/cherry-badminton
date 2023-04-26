import { Body, Controller, Post, Req } from '@nestjs/common';

import { BaseApiController } from '@base/api';
import { ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { LoggingService } from '@base/logging';

import { RequestUser } from '@modules/user/entities/user.entity';
import { FcmTokenService } from '@modules/user/services/fcm-token.service';
import { CreateFcmTokenDto } from '@modules/user/dto/fcm-token.dto';

@ApiTagsAndBearer('Fcm token')
@Controller('fcm-tokens')
export class FcmTokenController extends BaseApiController {
  constructor(
    private readonly service: FcmTokenService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(FcmTokenController.name);

  @Post('')
  @ApiOperation({ summary: 'Upsert fcm token about me' })
  async upsertFcmToken(@Req() req: RequestUser, @Body() body: CreateFcmTokenDto): Promise<void> {
    return this.service.upsert(req.user, body);
  }
}
