import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

import { BaseCrudService } from '@base/api';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';

import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';
import { Match } from '@modules/badminton-session/entities/match.entity';
import { MatchRepository } from '@modules/badminton-session/repositories/match.repository';
import { CreateMatchDto, UpdateMatchDto } from '@modules/badminton-session/dto/match.dto';
import { FinalScoreRepository } from '@modules/badminton-session/repositories/final-score.repository';
import { TeamRepository } from '@modules/badminton-session/repositories/team.repository';
import { EMatchStatus } from '@modules/badminton-session/constants/match.enum';
import { EBadmintonSessionStatus } from '@modules/badminton-session/constants/badminton-session.enum';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';

import { User, UserRepository } from '@modules/user';

@Injectable()
export class MatchService extends BaseCrudService<Match> {
  constructor(
    protected readonly repository: MatchRepository,
    protected readonly teamRepository: TeamRepository,
    protected readonly memberRepository: MemberRepository,
    protected readonly finalScoreRepository: FinalScoreRepository,
    protected readonly userRepository: UserRepository,
    protected readonly badmintonSessionRepository: BadmintonSessionRepository,
    private readonly loggingService: LoggingService,
  ) {
    super(Match, repository, 'match', loggingService.getLogger(MatchService.name));
  }

  async extendFindAllQuery(query: SelectQueryBuilder<Match>): Promise<SelectQueryBuilder<Match>> {
    return query
      .leftJoinAndSelect('match.teams', 'team')
      .leftJoinAndSelect('team.participates', 'participate')
      .leftJoinAndSelect('match.finalScore', 'finalScore')
      .leftJoinAndSelect('finalScore.winner', 'winner')
      .leftJoinAndSelect('finalScore.loser', 'loser');
  }

  async insert(user: User, data: CreateMatchDto) {
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
    const memberIds = data.teams.flatMap((team) => team.participates);
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .leftJoinAndSelect('member.badmintonSession', 'badmintonSession')
      .where('badmintonSession.id = :badmintonSessionId', {
        badmintonSessionId: data.badmintonSessionId,
      })
      .andWhere('user.id IN (:...memberIds)', { memberIds })
      .getMany();
    if (members.length !== memberIds.length) {
      throw new HttpExc.BadRequest({
        message: 'Some members not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    const match = this.repository.create({
      badmintonSession,
      type: data.type,
      moneyBet01: data.moneyBet01,
      moneyBet02: data.moneyBet02,
      moneyBet03: data.moneyBet03,
      teams: data.teams.map((team) => {
        return this.teamRepository.create({
          participates: team.participates.map((participate) => {
            return members.find((member) => member.id === participate).user;
          }),
        });
      }),
    });
    return this.repository.save(match);
  }

  async change(id: number, data: UpdateMatchDto, user: User) {
    const match = await this.repository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.badmintonSession', 'badmintonSession')
      .leftJoinAndSelect('badmintonSession.createdBy', 'createdBy')
      .leftJoinAndSelect('match.teams', 'team')
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
        message: 'You are not allowed to change this match',
        errorCode: 'NOT_ALLOWED_TO_CHANGE_MATCH',
      });
    }
    if (!data.status && match.status !== EMatchStatus.READY) {
      throw new HttpExc.BadRequest({
        message: 'Match is not ready',
        errorCode: 'MATCH_NOT_READY',
      });
    }
    if (
      data.status &&
      match.status === EMatchStatus.READY &&
      data.status !== EMatchStatus.STARTED
    ) {
      throw new HttpExc.BadRequest({
        message: 'Match is not started',
        errorCode: 'MATCH_NOT_STARTED',
      });
    }
    if (
      data.status &&
      match.status === EMatchStatus.STARTED &&
      data.status !== EMatchStatus.FINISHED
    ) {
      throw new HttpExc.BadRequest({
        message: 'Match is not finished',
        errorCode: 'MATCH_NOT_FINISHED',
      });
    }
    if (data.teams) {
      const memberIds = data.teams.flatMap((team) => team.participates);
      const members = await this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.user', 'user')
        .leftJoinAndSelect('member.badmintonSession', 'badmintonSession')
        .where('badmintonSession.id = :badmintonSessionId', {
          badmintonSessionId: match.badmintonSession.id,
        })
        .andWhere('user.id IN (:...memberIds)', { memberIds })
        .getMany();
      if (members.length !== memberIds.length) {
        throw new HttpExc.BadRequest({
          message: 'Some members not found',
          errorCode: 'USER_NOT_FOUND',
        });
      }
      await this.teamRepository.delete(match.teams.map((team) => team.id));
      match.teams = data.teams.map((team) => {
        return this.teamRepository.create({
          participates: team.participates.map((participate) => {
            return members.find((user) => user.id === participate).user;
          }),
        });
      });
      delete data.teams;
    }
    if (data.finalScore) {
      const winner = await this.teamRepository.findOneBy({ id: data.finalScore.winnerId });
      const loser = await this.teamRepository.findOneBy({ id: data.finalScore.loserId });
      if (!winner || !loser) {
        throw new HttpExc.BadRequest({
          message: 'Winner or loser not found',
          errorCode: 'WINNER_OR_LOSER_NOT_FOUND',
        });
      }
      match.finalScore = this.finalScoreRepository.create({
        ...data.finalScore,
        winner,
        loser,
      });
    }
    Object.assign(match, data);
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
    if (match.status !== EMatchStatus.READY) {
      throw new HttpExc.BadRequest({
        message: 'Match is not ready',
        errorCode: 'MATCH_IS_NOT_READY',
      });
    }
    return this.repository.softDelete(id);
  }
}
