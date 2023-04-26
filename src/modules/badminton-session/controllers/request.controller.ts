import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';

import { BaseApiController } from '@base/api';
import { ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { LoggingService } from '@base/logging';

import { RequestService } from '@modules/badminton-session/services/request.service';
import {
  ChangeStatusRequestDto,
  CreateRequestDto,
  ERequestQueryType,
  QueryRequestDto,
} from '@modules/badminton-session/dto/request.dto';

import { RequestUser } from '@modules/user';
import { ParamIdDto } from '@shared/dto/common.dto';

@ApiTagsAndBearer('Request')
@Controller('requests')
export class RequestController extends BaseApiController {
  constructor(
    private readonly service: RequestService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(RequestController.name);

  @ApiOperation({ summary: 'List all requests' })
  @Get()
  async list(@Req() req: RequestUser, @Query() query: QueryRequestDto) {
    return this.service.listWithPage({
      ...query,
      filter: {
        ...query.filter,
        ...(query.type === ERequestQueryType.SENT
          ? { createdBy: req.user.id }
          : query.type === ERequestQueryType.RECEIVED
          ? {
              ['badmintonSession.createdBy.id']: req.user.id,
              ['badmintonSession.id']: query.badmintonSessionId,
            }
          : {}),
      },
    });
  }

  @ApiOperation({ summary: 'Create a request' })
  @Post()
  async create(@Req() req: RequestUser, @Body() body: CreateRequestDto) {
    return this.service.insert(req.user, body);
  }

  @ApiOperation({ summary: 'Change request status' })
  @Put(':id')
  async change(
    @Req() req: RequestUser,
    @Param() param: ParamIdDto,
    @Body() body: ChangeStatusRequestDto,
  ) {
    return this.service.change(param.id, body.status, req.user);
  }

  @ApiOperation({ summary: 'Delete a request' })
  @Delete(':id')
  async delete(@Req() req: RequestUser, @Param() param: ParamIdDto) {
    return this.service.remove(param.id, req.user);
  }
}
