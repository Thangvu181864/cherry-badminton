import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import * as HttpExc from '@base/api/exception';
import { LoggingService } from '@base/logging';

import { IS_PUBLIC_KEY } from '@modules/auth/decorators/jwt.decorator';

import { EUserStages, User } from '@modules/user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  readonly logger = new LoggingService().getLogger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;
    return super.canActivate(context);
  }

  // @ts-ignore
  handleRequest(err: any, user: User, info: any, context: ExecutionContext, status?: any) {
    const request = context.switchToHttp().getRequest();
    if (err || !user) {
      throw new HttpExc.Unauthorized({ errorCode: 'JWT011G', message: 'Account is not verified' });
    }
    const allowedPaths = ['/api/v1/users', '/api/v1/auth/logout'];
    if (
      user.stages === EUserStages.INFORMATION &&
      !allowedPaths.some((path) => request.path.startsWith(path))
    ) {
      throw new HttpExc.Unauthorized({
        errorCode: 'JWT011G',
        message: 'Please complete your information',
      });
    }
    return user;
  }
}
