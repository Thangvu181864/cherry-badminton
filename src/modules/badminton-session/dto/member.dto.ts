import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional, IntersectionTypes } from '@base/docs';
import {
  PaginationSpecificationDto,
  QuerySpecificationDto,
  SearchSpecificationDto,
  SortSpecificationDto,
} from '@base/api/dto/query-specification.dto';

import { EMemeberPaymentStatus } from '@modules/badminton-session/constants/member.enum';

export const SEARCH_MEMBER_BY_VALID = ['user.displayName', 'user.email'];

export class CreateMemberDto {
  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  userId: number;

  @ApiProperty()
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId: number;
}

export class UpdateMemberDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => value && +value)
  @IsOptional()
  @IsPositive()
  surcharge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EMemeberPaymentStatus)
  paymentType?: EMemeberPaymentStatus;
}

export class QueryMemberDto extends IntersectionTypes(
  PaginationSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
  QuerySpecificationDto,
) {
  @ApiPropertyOptional({ required: false, name: 'searchFields[]' })
  @IsOptional()
  @IsArray()
  @IsIn(SEARCH_MEMBER_BY_VALID, { each: true })
  @IsString({ each: true })
  searchFields?: string[] = SEARCH_MEMBER_BY_VALID;

  @ApiPropertyOptional({ required: false, name: 'filter', type: 'string' })
  @IsOptional()
  filter?: Record<string, any>;

  @ApiPropertyOptional({ required: false, name: 'badmintonSessionId', type: 'number' })
  @Transform(({ value }) => value && +value)
  @IsNotEmpty()
  @IsPositive()
  badmintonSessionId?: number;
}
