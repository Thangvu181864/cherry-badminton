import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { RelatedDataType } from '@modules/notification/constants/notifications.constant';

export class CreateNotificationDetailDto {
  @ApiProperty({ example: 'Notification title' })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010101' })
  @IsString({ message: 'NOTIFICATIONHISTORY010102' })
  title!: string;

  @ApiProperty({ example: 'Notification body' })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010201' })
  @IsString({ message: 'NOTIFICATIONHISTORY010202' })
  body!: string;

  @ApiProperty({ example: 'Notification body with tag' })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010301' })
  @IsString({ message: 'NOTIFICATIONHISTORY010302' })
  bodyWithTag!: string;

  @ValidateIf((o) => o.relatedDataType)
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010401' })
  @IsString({ message: 'NOTIFICATIONHISTORY010402' })
  relatedDataId!: string;

  @ApiPropertyOptional({ example: RelatedDataType.USER })
  @IsOptional()
  @IsEnum(RelatedDataType, { message: 'NOTIFICATIONHISTORY010502' })
  relatedDataType?: RelatedDataType;
}
