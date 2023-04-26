import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { uniqueFileName } from '@base/util/file.utils';
import { ConfigModule, ConfigService } from '@config';

import { BadmintonSession } from '@modules/badminton-session/entities/badminton-session.entity';
import { BadmintonSessionRepository } from '@modules/badminton-session/repositories/badminton-session.repository';
import { BadmintonSessionController } from '@modules/badminton-session/controllers/badminton-session.controller';
import { BadmintonSessionService } from '@modules/badminton-session/services/badminton-session.service';
import { Address } from '@modules/badminton-session/entities/address.entity';
import { Member } from '@modules/badminton-session/entities/member.entity';
import { Match } from '@modules/badminton-session/entities/match.entity';
import { MemberRepository } from '@modules/badminton-session/repositories/member.repository';
import { MatchRepository } from '@modules/badminton-session/repositories/match.repository';
import { Request } from '@modules/badminton-session/entities/request.entity';
import { RequestRepository } from '@modules/badminton-session/repositories/request.repository';
import { RequestController } from '@modules/badminton-session/controllers/request.controller';
import { RequestService } from '@modules/badminton-session/services/request.service';
import { MemberController } from '@modules/badminton-session/controllers/member.controller';
import { MemberService } from '@modules/badminton-session/services/member.service';
import { Team } from '@modules/badminton-session/entities/team.entity';
import { FinalScore } from '@modules/badminton-session/entities/final-score.entity';
import { MatchController } from '@modules/badminton-session/controllers/match.controller';
import { MatchService } from '@modules/badminton-session/services/match.service';
import { FinalScoreRepository } from '@modules/badminton-session/repositories/final-score.repository';
import { TeamRepository } from '@modules/badminton-session/repositories/team.repository';

import { UserModule } from '@modules/user';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Address,
      Team,
      TeamRepository,
      FinalScore,
      FinalScoreRepository,
      BadmintonSession,
      BadmintonSessionRepository,
      Member,
      MemberRepository,
      Match,
      MatchRepository,
      Request,
      RequestRepository,
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        limits: {
          fileSize: config.UPLOAD_LIMIT_SIZE,
        },
        storage: diskStorage({
          destination: (req: Express.Request, file: Express.Multer.File, cb: any) => {
            if (!existsSync(config.UPLOAD_PATH)) {
              mkdirSync(config.UPLOAD_PATH, { recursive: true });
            }
            cb(null, config.UPLOAD_PATH);
          },
          filename: (req: Express.Request, file: Express.Multer.File, cb: any) => {
            cb(null, uniqueFileName(file.originalname));
          },
        }),
      }),
    }),
  ],
  controllers: [BadmintonSessionController, RequestController, MemberController, MatchController],
  providers: [
    BadmintonSessionService,
    BadmintonSessionRepository,
    RequestService,
    RequestRepository,
    MemberRepository,
    MemberService,
    MatchService,
    MatchRepository,
    TeamRepository,
    FinalScoreRepository,
  ],
  exports: [
    BadmintonSessionService,
    BadmintonSessionRepository,
    RequestService,
    RequestRepository,
    MemberRepository,
    MemberService,
    MatchService,
    MatchRepository,
    TeamRepository,
    FinalScoreRepository,
  ],
})
export class BadmintonSessionModule {}
