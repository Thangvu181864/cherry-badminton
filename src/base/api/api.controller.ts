import { Controller, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';

// CORE
// import { ResponseTransformInterceptor } from '@core/middleware';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api')
export class BaseApiController {}
