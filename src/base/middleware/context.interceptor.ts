import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_SKIP_FORBID } from '@base/middleware/validation.decorator';

/**
 * Injects request data into the context, so that the ValidationPipe can use it.
 */
@Injectable()
export class ContextInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector = new Reflector()) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isSkipForbid = this.reflector.getAllAndOverride<boolean>(IS_SKIP_FORBID, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    try {
      request.body.context = { [IS_SKIP_FORBID]: isSkipForbid };
    } catch (e) {
      /**/
    }
    return next.handle();
  }
}
