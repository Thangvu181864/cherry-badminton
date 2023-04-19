import * as ms from 'ms';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';

import * as HttpExc from '@base/api/exception';
import { RedisService } from '@base/db/redis';
import { LoggingService } from '@base/logging';
import { OtpService } from '@base/otp/otp.service';
import { ConfigService } from '@config';
import { QUEUE_NAME, SEND_MAIL } from '@shared/constants';

import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';
import { JwtAuthService } from '@modules/auth/services/jwt.service';
import { ILoginResponse } from '@modules/auth/interfaces/jwt.interface';

import {
  User,
  UserRepository,
  LoginAuthDto,
  RegisterAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  FcmTokenService,
  EUserState,
  EUserStages,
  ResendEmailDto,
} from '@modules/user';

@Injectable()
export class AuthService {
  readonly logger = new LoggingService().getLogger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly redisService: RedisService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly config: ConfigService,
    private readonly otpService: OtpService,
    @InjectQueue(QUEUE_NAME.SEND_MAIL) private readonly queueSendMail: Queue,
  ) {}

  async register(data: RegisterAuthDto): Promise<User> {
    const isExisted = await this.userRepository.getUserByUniqueKey({
      emailOrphoneNumber: data.email,
    });
    if (isExisted)
      throw new HttpExc.BadRequest({
        message: 'This email is already in use',
        errorCode: 'AUTH010201',
      });
    await this.queueSendMail.add(
      SEND_MAIL.RESGISTER,
      { email: data.email },
      { removeOnComplete: true },
    );
    const user = await this.userRepository.getUserByUniqueKey({
      emailOrphoneNumber: data.email,
      state: EUserState.INACTIVE,
    });
    if (!user) {
      return this.userRepository.createUser(data);
    }
    Object.assign(user, data);
    user.setPassword(data.password);
    return user.save();
  }

  async verifyEmail(data: VerifyEmailDto): Promise<ILoginResponse> {
    const user = await this.userRepository.getUserByUniqueKey({
      emailOrphoneNumber: data.email,
      state: EUserState.INACTIVE,
    });
    if (!user)
      throw new HttpExc.BadRequest({
        message: 'This email is not existed',
        errorCode: 'AUTH000201',
      });
    const isValid = this.otpService.verifyOTP(data.otp, this.config.OTP_SECRET);
    if (!isValid)
      throw new HttpExc.BadRequest({
        message: 'OTP is invalid',
        errorCode: 'AUTH000204',
      });
    user.state = EUserState.ACTIVE;
    user.stages = EUserStages.INFORMATION;
    await user.save();
    return this.getToken(user);
  }

  async resendEmail(data: ResendEmailDto): Promise<void> {
    const user = await this.userRepository.getUserByUniqueKey({
      emailOrphoneNumber: data.email,
      state: EUserState.INACTIVE,
    });
    if (!user)
      throw new HttpExc.BadRequest({
        message: 'This email is not existed',
        errorCode: 'AUTH000201',
      });
    await this.queueSendMail.add(
      SEND_MAIL.RESGISTER,
      { email: data.email },
      { removeOnComplete: true },
    );
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.getUserByUniqueKey({ emailOrphoneNumber: data.email });
    if (!user)
      throw new HttpExc.BadRequest({
        message: 'This email is not existed',
        errorCode: 'AUTH000201',
      });
    await this.queueSendMail.add(
      SEND_MAIL.FORGOT_PASSWORD,
      { email: data.email },
      { removeOnComplete: true },
    );
  }

  async resetPassword(data: ResetPasswordDto): Promise<ILoginResponse> {
    const user = await this.userRepository.getUserByUniqueKey({ emailOrphoneNumber: data.email });
    if (!user)
      throw new HttpExc.BadRequest({
        message: 'This email is not existed',
        errorCode: 'AUTH000201',
      });
    const isValid = this.otpService.verifyOTP(data.otp, this.config.OTP_SECRET);
    if (!isValid)
      throw new HttpExc.BadRequest({
        message: 'OTP is invalid',
        errorCode: 'AUTH000204',
      });
    user.setPassword(data.password);
    await user.save();
    return this.getToken(user);
  }

  async login(data: LoginAuthDto): Promise<ILoginResponse> {
    const user = await this.userRepository.getUserByUniqueKey({ emailOrphoneNumber: data.email });
    if (!user || !user.comparePassword(data.password))
      throw new HttpExc.BadRequest({
        message: 'The email or password is incorrect',
        errorCode: 'AUTH000202',
      });

    return this.getToken(user);
  }

  async logout(user: User): Promise<void> {
    await this.redisService.auth().del(`auth:refreshToken:${user.email}`);
    await this.fcmTokenService.remove(user.id);
    user.refreshAuthVersion();
    await user.save();
  }

  async refreshToken(data: RefreshTokenDto): Promise<any> {
    const { refreshToken } = data;
    const payload = this.jwtAuthService.verify(refreshToken, {
      secret: this.config.REFRESH_SECRET,
    });
    const refreshTokenRedis = await this.redisService
      .auth()
      .get(`auth:refreshToken:${payload.sub}`);
    if (!refreshTokenRedis || refreshTokenRedis !== refreshToken) {
      throw new HttpExc.Unauthorized({
        message: 'Refresh token invalid',
        errorCode: 'AUTH000203',
      });
    }
    const user = await this.jwtAuthService.authentication(payload);
    return this.getToken(user);
  }

  async getToken(user: User): Promise<ILoginResponse> {
    const accessToken = await this.jwtAuthService.createAccessToken(user);
    const refreshToken = await this.jwtAuthService.createRefreshToken(user);
    await this.redisService.auth().set(`auth:refreshToken:${user.email}`, refreshToken, {
      ttl: ms(this.config.REFRESH_TOKEN_EXP) / 1000,
    });
    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      user,
    };
  }
}
