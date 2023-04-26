import { MulterExceptionFilter } from '@base/middleware';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { BaseApiController } from '@base/api';
import { ApiConsumes, ApiOperation, ApiTagsAndBearer } from '@base/docs';
import { LoggingService } from '@base/logging';
import { ParamIdDto } from '@shared/dto/common.dto';

import { BadmintonSessionService } from '@modules/badminton-session/services/badminton-session.service';
import {
  CreateBadmintonSessionDto,
  EBadmintonSessionQueryType,
  QueryBadmintonSessionDto,
  UpdateBadmintonSessionDto,
} from '@modules/badminton-session/dto/badminton-session.dto';

import { RequestUser } from '@modules/user';

@ApiTagsAndBearer('Badminton session')
@Controller('badminton-sessions')
export class BadmintonSessionController extends BaseApiController {
  constructor(
    private readonly service: BadmintonSessionService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(BadmintonSessionController.name);

  @ApiOperation({ summary: 'List all badminton sessions' })
  @Get()
  async list(@Req() req: RequestUser, @Query() query: QueryBadmintonSessionDto) {
    return this.service.listWithPage({
      ...query,
      filter: {
        ...query.filter,
        ...(query.type === EBadmintonSessionQueryType.JOINED
          ? { ['user.id']: req.user.id }
          : query.type === EBadmintonSessionQueryType.ORGANIZED
          ? { createdBy: req.user.id }
          : {}),
      },
    });
  }

  @ApiOperation({ summary: 'Get a badminton session' })
  @Get(':id')
  async get(@Param() param: ParamIdDto) {
    return this.service.get(param.id);
  }

  @ApiOperation({ summary: 'Create a new badminton session' })
  @UseFilters(MulterExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  @Post()
  async create(
    @Req() req: RequestUser,
    @Body() body: CreateBadmintonSessionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.insert(req.user, body, file);
  }

  @ApiOperation({ summary: 'Update a badminton session' })
  @UseFilters(MulterExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('coverImage'))
  @Put(':id')
  async update(
    @Req() req: RequestUser,
    @Param() param: ParamIdDto,
    @Body() body: UpdateBadmintonSessionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.change(param.id, { ...body, coverImage: file }, req.user);
  }

  @ApiOperation({ summary: 'Delete a badminton session' })
  @Delete(':id')
  async delete(@Req() req: RequestUser, @Param() param: ParamIdDto) {
    return this.service.remove(param.id, req.user);
  }
}
