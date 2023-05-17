import { Transactional } from 'typeorm-transactional';
import { In, SelectQueryBuilder } from 'typeorm';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';

import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';
import { Match } from '@modules/badminton-session/entities/match.entity';
import { MatchRepository } from '@modules/badminton-session/repositories/match.repository';
import { CreateMatchDto, UpdateMatchDto } from '@modules/badminton-session/dto/match.dto';
import { TeamRepository } from '@modules/badminton-session/repositories/team.repository';
import { EMatchStatus } from '@modules/badminton-session/constants/match.enum';
import { EBadmintonSessionStatus } from '@modules/badminton-session/constants/badminton-session.enum';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';
import { ParticipantRepository } from '@modules/badminton-session/repositories/participant.repository';
import { ETeamResult } from '@modules/badminton-session/constants/team.enum';

import { User, UserRepository } from '@modules/user';

@Injectable()
export class MatchService extends BaseCrudService<Match> {
  constructor(
    protected readonly repository: MatchRepository,
    protected readonly teamRepository: TeamRepository,
    protected readonly memberRepository: MemberRepository,
    protected readonly participantRepository: ParticipantRepository,
    protected readonly userRepository: UserRepository,
    protected readonly badmintonSessionRepository: BadmintonSessionRepository,
    private readonly loggingService: LoggingService,
  ) {
    super(Match, repository, 'match', loggingService.getLogger(MatchService.name));
  }

  async extendFindAllQuery(query: SelectQueryBuilder<Match>): Promise<SelectQueryBuilder<Match>> {
    return query
      .leftJoin('match.teams', 'team')
      .leftJoin('team.participantes', 'participant')
      .leftJoin('participant.user', 'user')
      .addSelect(['team.id', 'team.result'])
      .addSelect(['participant.memberId', 'participant.order', 'participant.user'])
      .addSelect(['user.id', 'user.email', 'user.displayName', 'user.avatar']);
  }

  async insert(user: User, data: CreateMatchDto) {
    this.logger.info('Insert match', JSON.stringify(data));
    const badmintonSession = await this.badmintonSessionRepository.findOneBy({
      id: data.badmintonSessionId,
    });
    if (!badmintonSession) {
      throw new HttpExc.NotFound({
        message: 'Badminton session not found',
        errorCode: 'BADMINTON_SESSION_NOT_FOUND',
      });
    }
    if (badmintonSession.status === EBadmintonSessionStatus.FINISHED) {
      throw new HttpExc.BadRequest({
        message: 'Badminton session has finished',
        errorCode: 'BADMINTON_SESSION_HAS_FINISHED',
      });
    }
    const memberIds = data.teams.flatMap((team) =>
      team.participantes.map((participant) => participant.memberId),
    );
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.badmintonSession', 'badmintonSession')
      .where('badmintonSession.id = :badmintonSessionId', {
        badmintonSessionId: data.badmintonSessionId,
      })
      .andWhere('member.id IN (:...memberIds)', { memberIds })
      .getMany();
    if (members.length !== memberIds.length) {
      throw new HttpExc.BadRequest({
        message: 'Some members not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    const match = this.repository.create({
      ...data,
      badmintonSession,
      teams: data.teams.map((team) => {
        return this.teamRepository.create({
          participantes: this.participantRepository.create(
            team.participantes.map((participant) => ({
              user: members.find((member) => member.id === participant.memberId).user,
              order: participant.order,
              memberId: members.find((member) => member.id === participant.memberId).id,
            })),
          ),
        });
      }),
    });
    return this.repository.save(match);
  }

  async getOne(id: number) {
    return this.repository
      .createQueryBuilder('match')
      .leftJoin('match.teams', 'team')
      .leftJoin('team.participantes', 'participant')
      .leftJoin('participant.user', 'user')
      .addSelect(['team.id', 'team.result'])
      .addSelect(['participant.memberId', 'participant.order', 'participant.user'])
      .addSelect(['user.id', 'user.email', 'user.displayName', 'user.avatar'])
      .where('match.id = :id', { id })
      .getOne();
  }

  @Transactional()
  async change(id: number, data: UpdateMatchDto, user: User) {
    const match = await this.repository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.badmintonSession', 'badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .leftJoinAndSelect('match.teams', 'team')
      .leftJoinAndSelect('team.participantes', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .where('match.id = :id', { id })
      .getOne();
    if (!match) {
      throw new HttpExc.NotFound({
        message: 'Match not found',
        errorCode: 'MATCH_NOT_FOUND',
      });
    }
    if (match.status === EMatchStatus.FINISHED) {
      throw new HttpExc.BadRequest({
        message: 'Match has finished',
        errorCode: 'MATCH_HAS_FINISHED',
      });
    }
    if (match.badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'You are not allowed to change this match',
        errorCode: 'NOT_ALLOWED_TO_CHANGE_MATCH',
      });
    }

    if (match.status === EMatchStatus.STARTED) {
      if (data.teams) {
        const teamId = match.teams.map((team) => team.id);
        await this.teamRepository.delete({ id: In(teamId) });
        const memberIds = data.teams.flatMap((team) =>
          team.participantes.map((participant) => participant.memberId),
        );
        const members = await this.memberRepository
          .createQueryBuilder('member')
          .leftJoinAndSelect('member.user', 'user')
          .leftJoinAndSelect('member.badmintonSession', 'badmintonSession')
          .where('badmintonSession.id = :badmintonSessionId', {
            badmintonSessionId: match.badmintonSession.id,
          })
          .andWhere('member.id IN (:...memberIds)', { memberIds })
          .getMany();
        if (members.length !== memberIds.length) {
          throw new HttpExc.BadRequest({
            message: 'Some members not found',
            errorCode: 'USER_NOT_FOUND',
          });
        }
        match.teams = data.teams.map((team) => {
          return this.teamRepository.create({
            participantes: this.participantRepository.create(
              team.participantes.map((participant) => ({
                user: members.find((member) => member.id === participant.memberId).user,
                order: participant.order,
                memberId: members.find((member) => member.id === participant.memberId).id,
              })),
            ),
          });
        });
        delete data.teams;
      }
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const result = _.omitBy(data, _.isNull);
      Object.assign(match, result);
    }
    if (data.status === EMatchStatus.FINISHED) {
      const winnerTeam = match.teams.find((team) => team.id === data.winnerTeamId);
      const loserTeam = match.teams.find((team) => team.id !== data.winnerTeamId);
      if (!winnerTeam) {
        throw new HttpExc.BadRequest({
          message: 'Winner team not found',
          errorCode: 'WINNER_TEAM_NOT_FOUND',
        });
      }
      winnerTeam.result = ETeamResult.WINNER;
      loserTeam.result = ETeamResult.LOSER;

      const members = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.user', 'user')
        .leftJoin('member.badmintonSession', 'badmintonSession')
        .where('badmintonSession.id = :badmintonSessionId', {
          badmintonSessionId: match.badmintonSession.id,
        })
        .getMany();
      const shuttlesUsed = parseFloat(
        (
          data.numberOfShuttlesUsed /
          (winnerTeam.participantes.length + loserTeam.participantes.length)
        ).toFixed(2),
      );
      const winnerMembers = winnerTeam.participantes.map((participant) => {
        const member = members.find((member) => member.user.id === participant.user.id);
        member.shuttlesUsed = shuttlesUsed;
        member.winningAmount += match[`moneyBet0${participant.order}`];
        return member;
      });
      const loserMembers = loserTeam.participantes.map((participant) => {
        const member = members.find((member) => member.user.id === participant.user.id);
        member.shuttlesUsed = shuttlesUsed;
        member.winningAmount -= match[`moneyBet0${participant.order}`];
        return member;
      });
      await this.memberRepository.save([...winnerMembers, ...loserMembers]);
      match.teams = [winnerTeam, loserTeam];
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const result = _.omitBy(data, _.isNull);
      Object.assign(match, result);
    }

    return this.repository.save(match);
  }

  async remove(id: number, user: User) {
    const match = await this.repository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.badmintonSession', 'badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .where('match.id = :id', { id })
      .getOne();
    if (!match) {
      throw new HttpExc.NotFound({
        message: 'Match not found',
        errorCode: 'MATCH_NOT_FOUND',
      });
    }
    if (match.badmintonSession.createdBy.id !== user.id) {
      throw new HttpExc.Forbidden({
        message: 'You are not allowed to remove this match',
        errorCode: 'NOT_ALLOWED_TO_REMOVE_MATCH',
      });
    }
    if (match.status !== EMatchStatus.STARTED) {
      throw new HttpExc.BadRequest({
        message: 'Match is not started',
        errorCode: 'MATCH_IS_NOT_STARTED',
      });
    }
    return this.repository.softDelete(id);
  }
}
