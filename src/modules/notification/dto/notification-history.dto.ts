import { ApiProperty, ApiPropertyOptional, IntersectionTypes } from '@base/docs';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  PaginationSpecificationDto,
  QuerySpecificationDto,
  SearchSpecificationDto,
  SortSpecificationDto,
} from '@base/api/dto/query-specification.dto';

import { CreateNotificationDetailDto } from '@modules/notification/dto/notification-detail.dto';

export const SEARCH_BY_VALID = ['notificationDetail.title', 'notificationDetail.body'];

export class QueryDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;
}

export class ReadIdsDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010101' })
  @IsArray({ message: 'NOTIFICATIONHISTORY010102' })
  @IsPositive({ each: true, message: 'NOTIFICATIONHISTORY010103' })
  ids?: number[];
}

export class CreateNotificationHistoryDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'NOTIFICATIONHISTORY010201' })
  @IsPositive({ message: 'NOTIFICATIONHISTORY010202' })
  receiverId!: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean({ message: 'NOTIFICATIONHISTORY010203' })
  isImportant?: boolean;

  @ApiProperty({ type: CreateNotificationDetailDto })
  @ValidateNested()
  @Type(() => CreateNotificationDetailDto)
  notificationDetail!: CreateNotificationDetailDto;
}
