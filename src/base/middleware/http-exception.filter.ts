import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

import { config } from '@config';
import { LoggingService } from '@base/logging';
import * as HttpExc from '@base/api/exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  private logger = this.loggingService.getLogger('http-exception');

  catch(exception: HttpException, host: ArgumentsHost) {
    if (host.getType() !== 'http') return;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    let excResponse = exception.getResponse();
    if (
      (config.FIXED_STATUS_CODE && typeof excResponse !== 'object') ||
      !Object.getOwnPropertyDescriptor(excResponse, 'success')
    ) {
      let newDataResponse: Record<string, any> =
        typeof excResponse === 'object' ? excResponse : { message: excResponse };
      newDataResponse = newDataResponse?.message;
      excResponse = new HttpExc.BadRequest({
        errorCode: HttpExc.STATUS_CODE_MAP[status] ?? HttpExc.UNKNOWN,
        data: newDataResponse,
      }).getResponse();
    }
    this.logger.debug(exception.getStatus(), excResponse);
    response.status(config.FIXED_STATUS_CODE ? 200 : status).json(excResponse);
  }
}
