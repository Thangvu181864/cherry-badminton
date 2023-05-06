import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { In, IsNull, Not, Repository, SelectQueryBuilder } from 'typeorm';

import * as HttpExc from '@base/api/exception';
import { LoggingService } from '@base/logging';
import { BaseCrudService } from '@base/api/base-crud.service';
import { ConfigService } from '@config';

import { UserRepository } from '@modules/user/repositories/user.repository';
import { User } from '@modules/user/entities/user.entity';
import { ChangePasswordDto, QueryUserDto, UpdateInfoDto } from '@modules/user/dto/user.dto';
import { EUserStages } from '@modules/user/constants/stages.enum';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';

@Injectable()
export class UserService extends BaseCrudService<User> {
  constructor(
    protected readonly repository: UserRepository,
    @InjectRepository(BadmintonSession)
    protected readonly badmintonSessionRepository: Repository<BadmintonSession>,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    super(User, repository, 'user', loggingService.getLogger(UserService.name));
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<User>,
    queryDto?: QueryUserDto,
  ): Promise<SelectQueryBuilder<User>> {
    if (queryDto.badmintonSessionId) {
      const badmintonSession = await this.badmintonSessionRepository
        .createQueryBuilder('badmintonSession')
        .leftJoinAndSelect('badmintonSession.members', 'member')
        .leftJoinAndSelect('member.user', 'user')
        .andWhere({ id: queryDto.badmintonSessionId })
        .getOne();
      if (!badmintonSession) {
        throw new HttpExc.NotFound({ message: 'Badminton session not found' });
      }
      const userIds = badmintonSession.members.map((member) => member.user.id);
      query.andWhere({
        id: Not(In(userIds)),
      });
    }
    return query.andWhere({
      stages: EUserStages.COMPLETION,
    });
  }

  async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
    const user = await this.getEntity(id);

    const isMatchOld = user.comparePassword(data.oldPassword);
    if (!isMatchOld)
      throw new HttpExc.BadRequest({
        message: 'Old password is incorrect',
        errorCode: 'USER012102',
      });

    const isMatch = user.comparePassword(data.newPassword);
    if (isMatch)
      throw new HttpExc.BadRequest({
        message: 'New password must not equal current password',
        errorCode: 'USER012103',
      });

    user.setPassword(data.newPassword);
    await user.save();
  }

  async updateInfo(id: number, data: UpdateInfoDto): Promise<User> {
    const user = await this.getEntity(id);
    const phoneNumberExist = await this.repository.getUserByPhoneNumber(data.phoneNumber);
    if (phoneNumberExist && phoneNumberExist.id !== id) {
      throw new HttpExc.BadRequest({
        message: 'Phone number already exists',
        errorCode: 'USER012101',
      });
    }
    if (data.avatar) {
      user.avatar && unlinkSync(user.avatar.replace(`${this.configService.DOMAIN}/`, ''));
      user.avatar = data.avatar.path;
      delete data.avatar;
    }
    Object.assign(user, data);
    if (user.stages === EUserStages.INFORMATION) {
      user.stages = EUserStages.COMPLETION;
    }
    await user.save();
    return this.getEntity(id);
  }

  async getAvatarPaths(): Promise<string[]> {
    const users = await this.repository.find({
      where: {
        avatar: Not(IsNull()),
      },
    });
    return users.map((user) =>
      user.avatar.replace(`${this.configService.DOMAIN}/${this.configService.UPLOAD_PATH}/`, ''),
    );
  }
}
