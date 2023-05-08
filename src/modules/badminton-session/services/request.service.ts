import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';

import { Request } from '@modules/badminton-session/entities/request.entity';
import { RequestRepository } from '@modules/badminton-session/repositories/request.repository';
import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';
import { CreateRequestDto } from '@modules/badminton-session/dto/request.dto';
import { EBadmintonSessionStatus } from '@modules/badminton-session/constants/badminton-session.enum';
import { ERequestStatus } from '@modules/badminton-session/constants/request.enum';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';

import { User } from '@modules/user';

@Injectable()
export class RequestService extends BaseCrudService<Request> {
  constructor(
    protected readonly repository: RequestRepository,
    protected readonly memberRepository: MemberRepository,
    protected readonly badmintonSessionRepository: BadmintonSessionRepository,
    private readonly loggingService: LoggingService,
  ) {
    super(Request, repository, 'request', loggingService.getLogger(RequestService.name));
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<Request>,
  ): Promise<SelectQueryBuilder<Request>> {
    return query
      .leftJoin('request.createdBy', 'createdBy')
      .leftJoin('request.badmintonSession', 'badmintonSession')
      .addSelect(['createdBy.displayName', 'createdBy.email', 'createdBy.avatar'])
      .addSelect(['badmintonSession.id', 'badmintonSession.name']);
  }

  async insert(user: User, data: CreateRequestDto) {
    const badmintonSession = await this.badmintonSessionRepository
      .createQueryBuilder('badmintonSession')
      .leftJoinAndSelect('badmintonSession.members', 'member')
      .leftJoinAndSelect('member.user', 'memberUser')
      .where('badmintonSession.id = :id', { id: data.badmintonSessionId })
      .getOne();
    if (!badmintonSession) {
      throw new HttpExc.NotFound({ message: 'Badminton session not found' });
    }
    if (badmintonSession.status !== EBadmintonSessionStatus.NEW) {
      throw new HttpExc.NotFound({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_PENDING',
      });
    }
    const member = badmintonSession.members.find((m) => m.user.id === user.id);
    if (member) {
      throw new HttpExc.BadRequest({
        message: 'You are already a member of this badminton session',
        errorCode: 'ALREADY_MEMBER',
      });
    }
    if (badmintonSession.members.length >= badmintonSession.numberOfPeople) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session is full',
        errorCode: 'BADMINTON_SESSION_FULL',
      });
    }
    const request = this.repository.create({
      ...data,
      createdBy: user,
      badmintonSession,
    });

    return this.repository.save(request);
  }

  async change(id: number, status: ERequestStatus, user: User) {
    const request = await this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.badmintonSession', 'badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .where('request.id = :id', { id })
      .getOne();
    if (!request) {
      throw new HttpExc.NotFound({ message: 'Request not found', errorCode: 'REQUEST_NOT_FOUND' });
    }
    if (request.badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'You are not the owner of this badminton session',
        errorCode: 'NOT_OWNER',
      });
    }
    if (request.status !== ERequestStatus.PENDING) {
      throw new HttpExc.BadRequest({
        message: 'Request is not in pending status',
        errorCode: 'REQUEST_NOT_PENDING',
      });
    }
    if (status === ERequestStatus.ACCEPTED) {
      await this.memberRepository.save({
        user: request.badmintonSession.createdBy,
        badmintonSession: request.badmintonSession,
      });
    }
    request.status = status;
    return this.repository.save(request);
  }

  async remove(id: number, user: User) {
    const request = await this.repository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.createdBy', 'createdBy')
      .getOne();
    if (!request) {
      throw new HttpExc.NotFound({ message: 'Request not found', errorCode: 'REQUEST_NOT_FOUND' });
    }
    if (request.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'You are not the owner of this request',
        errorCode: 'NOT_OWNER',
      });
    }
    return this.repository.softDelete(id);
  }
}
