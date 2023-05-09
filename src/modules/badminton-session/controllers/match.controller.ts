import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';

import { BaseApiController } from '@base/api';
import { ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { LoggingService } from '@base/logging';
import { ParamIdDto } from '@shared/dto/common.dto';

import { MatchService } from '@modules/badminton-session/services/match.service';
import {
  CreateMatchDto,
  QueryMatchDto,
  UpdateMatchDto,
} from '@modules/badminton-session/dto/match.dto';

import { RequestUser } from '@modules/user';

@ApiTagsAndBearer('Match')
@Controller('matches')
export class MatchController extends BaseApiController {
  constructor(
    private readonly service: MatchService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(MatchController.name);

  @ApiOperation({ summary: 'List all matches' })
  @Get()
  async findAll(@Req() req: RequestUser, @Query() query: QueryMatchDto) {
    return this.service.listWithPage({
      ...query,
      filter: {
        ...query.filter,
        badmintonSession: query.badmintonSessionId,
      },
    });
  }

  @ApiOperation({ summary: 'Create a new match' })
  @Post()
  async create(@Req() req: RequestUser, @Body() body: CreateMatchDto) {
    return this.service.insert(req.user, body);
  }

  @ApiOperation({ summary: 'Get a match by id' })
  @Get(':id')
  async findOne(@Param() param: ParamIdDto) {
    return this.service.getEntity(param.id);
  }

  @ApiOperation({ summary: 'Update a match' })
  @Put(':id')
  async update(@Req() req: RequestUser, @Param() param: ParamIdDto, @Body() body: UpdateMatchDto) {
    return this.service.change(param.id, body, req.user);
  }

  @ApiOperation({ summary: 'Delete a match' })
  @Delete(':id')
  async delete(@Req() req: RequestUser, @Param() param: ParamIdDto) {
    return this.service.remove(param.id, req.user);
  }
}
