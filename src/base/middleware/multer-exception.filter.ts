import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@/base/middleware';
import * as HttpExc from '@/base/api/exception';

export class MulterExceptionFilter extends HttpExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception.getStatus() === HttpStatus.PAYLOAD_TOO_LARGE)
      exception = new HttpExc.PayloadTooLarge({
        message: 'Data exceeds the allowed size',
        errorCode: 'PAYLOAD_TOO_LARGE',
      });

    super.catch(exception, host);
  }
}
