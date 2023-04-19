import { Injectable, ArgumentMetadata } from '@nestjs/common';
import { ValidationPipe as NestValidationPipe } from '@nestjs/common';
import { IS_SKIP_FORBID } from '@base/middleware/validation.decorator';

@Injectable()
export class ValidationPipe extends NestValidationPipe {
  transform(value: any, metadata: ArgumentMetadata) {
    const currentForbid = this.validatorOptions.forbidNonWhitelisted;
    if (value?.context?.[IS_SKIP_FORBID]) this.validatorOptions.forbidNonWhitelisted = false;
    delete value?.context;
    if (metadata.type === 'query' && value?.filter)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,no-empty
      try {
        value['filter'] = JSON.parse(value?.filter);
      } catch (e) {}

    const ret = super.transform(value, metadata);
    this.validatorOptions.forbidNonWhitelisted = currentForbid;
    return ret;
  }
}
