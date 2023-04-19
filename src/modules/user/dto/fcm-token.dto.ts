import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFcmTokenDto {
  @ApiProperty({ example: 'fcm_token' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty({ message: 'FCMTOKEN010101' })
  @IsString({ message: 'FCMTOKEN010102' })
  token!: string;
}
