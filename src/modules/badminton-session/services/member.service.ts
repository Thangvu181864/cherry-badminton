import { Injectable } from '@nestjs/common';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';

import { Member } from '@modules/badminton-session/entities/member.entity';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';
import { CreateMemberDto } from '@modules/badminton-session/dto/member.dto';
import { EBadmintonSessionStatus } from '@modules/badminton-session/constants/badminton-session.enum';
import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';

import { UserRepository, User } from '@modules/user';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MemberService extends BaseCrudService<Member> {
  constructor(
    protected readonly repository: MemberRepository,
    protected readonly userRepository: UserRepository,
    protected readonly badmintonSessionRepository: BadmintonSessionRepository,
    private readonly loggingService: LoggingService,
  ) {
    super(Member, repository, 'member', loggingService.getLogger(MemberService.name));
  }

  async extendFindAllQuery(query: SelectQueryBuilder<Member>): Promise<SelectQueryBuilder<Member>> {
    return query
      .leftJoin('member.user', 'memberUser')
      .addSelect([
        'member.winningAmount',
        'member.surcharge',
        'member.totalFee',
        'member.shuttlesUsed',
        'member.paymentType',
        'member.user',
      ])
      .addSelect(['memberUser.displayName', 'memberUser.email', 'memberUser.avatar']);
  }

  async insert(user: User, data: CreateMemberDto) {
    const userExist = await this.userRepository.findOneBy({ id: data.userId });
    if (!userExist) {
      throw new HttpExc.NotFound({ message: 'User not found', errorCode: 'USER_NOT_FOUND' });
    }
    const badmintonSession = await this.badmintonSessionRepository
      .createQueryBuilder('badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .leftJoinAndSelect('badmintonSession.members', 'member')
      .leftJoinAndSelect('member.user', 'memberUser')
      .where('badmintonSession.id = :id', { id: data.badmintonSessionId })
      .getOne();
    if (!badmintonSession) {
      throw new HttpExc.NotFound({
        message: 'Badminton session not found',
        errorCode: 'BADMINTON_SESSION_NOT_FOUND',
      });
    }
    if (badmintonSession.status !== EBadmintonSessionStatus.PENDING) {
      throw new HttpExc.NotFound({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_PENDING',
      });
    }
    if (badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'User is not allowed to add member',
        errorCode: 'USER_NOT_ALLOWED_TO_ADD_MEMBER',
      });
    }
    const member = badmintonSession.members.find((m) => m.user.id === userExist.id);
    if (member) {
      throw new HttpExc.BadRequest({
        message: 'User is already a member of this badminton session',
        errorCode: 'USER_ALREADY_MEMBER',
      });
    }
    return this.repository.save({
      user: userExist,
      badmintonSession,
    });
  }

  async remove(id: number, user: User) {
    const member = await this.repository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.badmintonSession', 'badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .where('member.id = :id', { id })
      .getOne();
    if (!member) {
      throw new HttpExc.NotFound({ message: 'Member not found', errorCode: 'MEMBER_NOT_FOUND' });
    }
    if (member.badmintonSession.status !== EBadmintonSessionStatus.PENDING) {
      throw new HttpExc.NotFound({
        message: 'Badminton session is not in pending status',
        errorCode: 'BADMINTON_SESSION_NOT_PENDING',
      });
    }

    if (member.badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'User is not allowed to remove member',
        errorCode: 'USER_NOT_ALLOWED_TO_REMOVE_MEMBER',
      });
    }

    return this.repository.softDelete(id);
  }
}
