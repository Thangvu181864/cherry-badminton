import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_FORBID = 'isSkipForbid';
export const SkipValidatorForbid = () => SetMetadata(IS_SKIP_FORBID, true);
