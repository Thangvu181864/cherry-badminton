import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Post, Req, Body, Controller } from '@nestjs/common';

import { ApiOperation, ApiTags, ApiBearerAuth } from '@base/docs';
import { BaseApiController } from '@base/api';
import { LoggingService } from '@base/logging';

import { AuthService } from '@modules/auth/services/auth.service';
import { SkipAuth } from '@modules/auth/decorators/jwt.decorator';
import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';
import { ILoginResponse } from '@modules/auth/interfaces/jwt.interface';

import {
  ForgotPasswordDto,
  LoginAuthDto,
  RegisterAuthDto,
  RequestUser,
  ResendEmailDto,
  ResetPasswordDto,
  User,
  VerifyEmailDto,
} from '@modules/user';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController extends BaseApiController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  logger = new LoggingService().getLogger(AuthController.name);

  @SkipAuth()
  @ApiOperation({ summary: 'Register for employee account' })
  @Post('/register')
  async register(@Body() body: RegisterAuthDto): Promise<User> {
    return this.authService.register(body);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'Verify email' })
  @Post('/verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto): Promise<ILoginResponse> {
    return this.authService.verifyEmail(body);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'Resend verify email' })
  @Post('/resend-email')
  async resendVerifyEmail(@Body() body: ResendEmailDto): Promise<void> {
    return this.authService.resendEmail(body);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'Forgot password' })
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(body);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'Reset password' })
  @Post('/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto): Promise<ILoginResponse> {
    return this.authService.resetPassword(body);
  }

  @SkipAuth()
  @ApiOperation({ summary: 'Login to the system' })
  @Post('/login')
  async login(@Body() body: LoginAuthDto) {
    return this.authService.login(body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @Post('/logout')
  async logout(@Req() req: RequestUser) {
    return this.authService.logout(req.user);
  }

  @SkipAuth()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Refresh access token' })
  @Post('/refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body);
  }
}
