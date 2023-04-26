import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';

import { BaseApiController } from '@base/api';
import { ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { LoggingService } from '@base/logging';
import { ParamIdDto } from '@shared/dto/common.dto';

import { MemberService } from '@modules/badminton-session/services/member.service';
import { CreateMemberDto, QueryMemberDto } from '@modules/badminton-session/dto/member.dto';

import { RequestUser } from '@modules/user/entities/user.entity';

@ApiTagsAndBearer('Member')
@Controller('members')
export class MemberController extends BaseApiController {
  constructor(
    private readonly service: MemberService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(MemberController.name);

  @ApiOperation({ summary: 'List all members' })
  @Get()
  async list(@Query() query: QueryMemberDto) {
    return this.service.listWithPage({
      ...query,
      filter: {
        ...query.filter,
        badmintonSession: query.badmintonSessionId,
      },
    });
  }

  @ApiOperation({ summary: 'Add member to badminton session' })
  @Post()
  async insert(@Req() req: RequestUser, @Body() body: CreateMemberDto) {
    return this.service.insert(req.user, body);
  }

  @ApiOperation({ summary: 'Remove member from badminton session' })
  @Delete(':id')
  async delete(@Req() req: RequestUser, @Param() param: ParamIdDto) {
    return this.service.remove(param.id, req.user);
  }
}
