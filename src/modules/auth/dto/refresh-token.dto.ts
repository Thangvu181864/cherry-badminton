import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@base/docs';

export class RefreshTokenDto {
  @ApiProperty()
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
