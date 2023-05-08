import { Injectable } from '@nestjs/common';
import { unlinkSync } from 'fs';
import { In, IsNull, Not, SelectQueryBuilder } from 'typeorm';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';
import { ConfigService } from '@config';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';
import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';
import {
  CreateBadmintonSessionDto,
  QueryBadmintonSessionDto,
  UpdateBadmintonSessionDto,
} from '@modules/badminton-session/dto/badminton-session.dto';
import { EBadmintonSessionStatus } from '@modules/badminton-session/constants/badminton-session.enum';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';
import { EMemeberPaymentStatus } from '@modules/badminton-session/constants/member.enum';

import { User, UserRepository } from '@modules/user';

@Injectable()
export class BadmintonSessionService extends BaseCrudService<BadmintonSession> {
  constructor(
    protected readonly repository: BadmintonSessionRepository,
    protected readonly memberRepository: MemberRepository,
    protected readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
  ) {
    super(
      BadmintonSession,
      repository,
      'badmintonSession',
      loggingService.getLogger(BadmintonSession.name),
    );
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<BadmintonSession>,
    queryDto?: QueryBadmintonSessionDto,
  ): Promise<SelectQueryBuilder<BadmintonSession>> {
    console.log('extendFindAllQuery', queryDto);
    return query
      .leftJoin('badmintonSession.createdBy', 'createdBy')
      .leftJoin('badmintonSession.address', 'address')
      .leftJoin('badmintonSession.members', 'member')
      .leftJoin('member.user', 'user')
      .leftJoin('badmintonSession.matches', 'match')
      .addSelect(['createdBy.displayName', 'createdBy.email', 'createdBy.avatar'])
      .addSelect(['address.name', 'address.note', 'address.lat', 'address.lng'])
      .addSelect([
        'member.id',
        'member.winningAmount',
        'member.surcharge',
        'member.totalFee',
        'member.shuttlesUsed',
        'member.paymentStatus',
        'member.user',
      ])
      .addSelect(['user.displayName', 'user.email', 'user.avatar']);
  }

  async get(id: number) {
    let queryBuilder = this.repository.createQueryBuilder('badmintonSession');
    queryBuilder = await this.extendFindAllQuery(queryBuilder);
    const badmintonSession = await queryBuilder.where('badmintonSession.id = :id', { id }).getOne();
    if (!badmintonSession) {
      throw new HttpExc.NotFound({ message: 'Badminton session not found' });
    }
    return badmintonSession;
  }

  async insert(user: User, data: CreateBadmintonSessionDto, file: Express.Multer.File) {
    const badmintonSession = await this.repository.save({
      ...data,
      coverImage: file?.path,
      createdBy: user,
    });
    const memberIds = data?.memberIds ?? [];
    const users = await this.userRepository.find({ where: { id: In(memberIds) } });

    if (users.length !== memberIds.length) {
      throw new HttpExc.BadRequest({
        message: 'Some members are not found',
        errorCode: 'MEMBERS_NOT_FOUND',
      });
    }

    await this.memberRepository.save([
      { user, badmintonSession },
      ...users.map((user) => ({ user, badmintonSession })),
    ]);

    return this.get(badmintonSession.id);
  }

  async change(id: number, data: UpdateBadmintonSessionDto, user: User) {
    const badmintonSession = await this.repository
      .createQueryBuilder('badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .where('badmintonSession.id = :id', { id })
      .getOne();
    if (!badmintonSession) {
      throw new HttpExc.NotFound({
        message: 'Badminton session not found',
        errorCode: 'BADMINTON_SESSION_NOT_FOUND',
      });
    }
    if (!data.status && badmintonSession.status !== EBadmintonSessionStatus.NEW) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_READY',
      });
    }
    if (
      data.status &&
      data.status === EBadmintonSessionStatus.STARTED &&
      badmintonSession.status !== EBadmintonSessionStatus.NEW
    ) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_READY',
      });
    }
    if (
      data.status &&
      data.status === EBadmintonSessionStatus.FINISHED &&
      badmintonSession.status !== EBadmintonSessionStatus.STARTED
    ) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is not in started status',
        errorCode: 'BADMINTON_SESSION_NOT_READY',
      });
    }
    if (badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'Badminton session is not created by you',
        errorCode: 'BADMINTON_SESSION_NOT_CREATED_BY_YOU',
      });
    }
    if (data.coverImage) {
      badmintonSession.coverImage && unlinkSync(badmintonSession.coverImage);
      badmintonSession.coverImage = data.coverImage.path;
      delete data.coverImage;
    }
    if (data.status && data.status === EBadmintonSessionStatus.FINISHED) {
      const memberUnPaid = await this.memberRepository.find({
        where: {
          badmintonSession: {
            id,
          },
          paymentStatus: EMemeberPaymentStatus.UNPAID,
        },
      });
      if (memberUnPaid.length > 0) {
        throw new HttpExc.BadRequest({
          message: 'Some members are not paid',
          errorCode: 'MEMBERS_NOT_PAID',
        });
      }
    }
    Object.assign(badmintonSession, data);
    return this.repository.save(badmintonSession);
  }

  async remove(id: number, user: User) {
    const badmintonSession = await this.getEntity(id);
    if (badmintonSession.status !== EBadmintonSessionStatus.NEW) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_READY',
      });
    }
    if (badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is not created by you',
        errorCode: 'BADMINTON_SESSION_NOT_CREATED_BY_YOU',
      });
    }
    badmintonSession.coverImage && unlinkSync(badmintonSession.coverImage);
    return this.repository.softDelete(id);
  }

  async getCoverImagePaths() {
    const badmintonSessions = await this.repository.find({
      where: {
        coverImage: Not(IsNull()),
      },
    });
    return badmintonSessions.map((badmintonSession) =>
      badmintonSession.coverImage.replace(
        `${this.configService.DOMAIN}/${this.configService.UPLOAD_PATH}/`,
        '',
      ),
    );
  }
}
