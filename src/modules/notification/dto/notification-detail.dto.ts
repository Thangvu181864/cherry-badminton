import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { RelatedDataType } from '@modules/notification/constants/notifications.constant';

export class CreateNotificationDetailDto {
  @ApiProperty({ example: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Notification body' })
  @IsNotEmpty()
  @IsString()
  body!: string;

  @ApiProperty({ example: 'Notification body with tag' })
  @IsNotEmpty()
  @IsString()
  bodyWithTag!: string;

  @ValidateIf((o) => o.relatedDataType)
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsString()
  relatedDataId!: string;

  @ApiPropertyOptional({ example: RelatedDataType.USER })
  @IsOptional()
  @IsEnum(RelatedDataType)
  relatedDataType?: RelatedDataType;
}
