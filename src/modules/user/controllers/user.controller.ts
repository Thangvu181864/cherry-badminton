import {
  Body,
  Controller,
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
import { MulterExceptionFilter } from '@base/middleware';
import { ParamIdDto } from '@shared/dto/common.dto';

import { ChangePasswordDto, QueryUserDto, UpdateInfoDto } from '@modules/user/dto/user.dto';
import { UserService } from '@modules/user/services/user.service';
import { RequestUser, User } from '@modules/user/entities/user.entity';

@ApiTagsAndBearer('User')
@Controller('users')
export class UserController extends BaseApiController {
  constructor(
    private readonly service: UserService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(UserController.name);

  @ApiOperation({ summary: 'List users' })
  @Get()
  async list(@Query() query: QueryUserDto) {
    return this.service.listWithPage(query);
  }

  @ApiOperation({ summary: 'Get information about me' })
  @Get('/info')
  async getInfo(@Req() req: RequestUser): Promise<User> {
    return req.user;
  }

  @Post('/change-password')
  @ApiOperation({ summary: 'Change password about me' })
  async changePassword(@Req() req: RequestUser, @Body() body: ChangePasswordDto): Promise<void> {
    return this.service.changePassword(req.user.id, body);
  }

  @ApiOperation({ summary: 'Change information about me' })
  @UseFilters(MulterExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/info')
  async updateInfo(
    @Req() req: RequestUser,
    @Body() body: UpdateInfoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.service.updateInfo(req.user.id, {
      ...body,
      avatar: file,
    });
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<User> {
    return this.service.getEntity(param.id);
  }

}
