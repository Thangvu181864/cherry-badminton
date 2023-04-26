import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class CreateFcmTokenDto {
  @ApiProperty({ example: 'fcm_token' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  token!: string;
}
