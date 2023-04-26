import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@base/docs';

export class CreateAddressDto {
  @ApiProperty({ example: 'address name' })
  @Transform(({ value }) => value && value.trim())
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'address note' })
  @Transform(({ value }) => value && value.trim())
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 10.123456 })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsLatitude()
  lat!: number;

  @ApiProperty({ example: 106.123456 })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsLongitude()
  lng!: number;
}
