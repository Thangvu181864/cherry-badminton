import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtVerifyOptions } from '@nestjs/jwt';

import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';
import { ALL_MESSAGES, SYSTEM_ERROR } from '@base/api/exception';
import { ConfigService } from '@config';

import { IJwtPayload } from '@modules/auth/interfaces/jwt.interface';

import { User, UserRepository } from '@modules/user';

@Injectable()
export class JwtAuthService {
  readonly logger = new LoggingService().getLogger(JwtAuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /* JWT TOKEN */
  verify = (token: string, options?: JwtVerifyOptions) => {
    try {
      return this.jwtService.verify(token, options);
    } catch (error) {
      this.logger.error(error);
      if (error.name === 'JsonWebTokenError') {
        throw new HttpExc.BusinessException({ message: error.message, errorCode: 'JWT011S' });
      }
      throw new HttpExc.BusinessException({
        message: ALL_MESSAGES[SYSTEM_ERROR],
        errorCode: SYSTEM_ERROR,
      });
    }
  };

  async authentication(payload: IJwtPayload): Promise<User> {
    try {
      const { sub, uav } = payload;
      const user = await this.userRepository.getUserByUniqueKey({ emailOrphoneNumber: sub });
      if (!user || String(uav) !== String(user.authVersion)) {
        throw new HttpExc.Unauthorized({ message: 'Authentication failed', errorCode: 'JWT012S' });
      }
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new HttpExc.BusinessException({
        message: ALL_MESSAGES[SYSTEM_ERROR],
        errorCode: SYSTEM_ERROR,
      });
    }
  }

  async createAccessToken(user: User): Promise<string> {
    try {
      const payload: IJwtPayload = {
        sub: user.email,
        uav: user.authVersion,
      };

      return this.jwtService.sign(payload);
    } catch (error) {
      this.logger.error(error);
      throw new HttpExc.BusinessException({
        message: ALL_MESSAGES[SYSTEM_ERROR],
        errorCode: SYSTEM_ERROR,
      });
    }
  }

  async createRefreshToken(user: User): Promise<string> {
    try {
      const payload: IJwtPayload = {
        sub: user.email,
        uav: user.authVersion,
      };
      const jwtOpts = {
        secret: this.config.REFRESH_SECRET,
        expiresIn: this.config.REFRESH_TOKEN_EXP,
      };
      return this.jwtService.sign(payload, jwtOpts);
    } catch (error) {
      this.logger.error(error);
      throw new HttpExc.BusinessException({
        message: ALL_MESSAGES[SYSTEM_ERROR],
        errorCode: SYSTEM_ERROR,
      });
    }
  }
}
