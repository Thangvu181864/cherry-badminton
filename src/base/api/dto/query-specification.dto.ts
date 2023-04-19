import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { config } from '@config';
import { ApiProperty } from '@nestjs/swagger';
import { IntersectionTypes } from '@base/docs';

export class PaginationSpecificationDto {
  @IsOptional()
  @Transform(({ value }) => value && parseInt(String(value)))
  @IsPositive()
  @Max(config.PAGINATION_PAGE_SIZE)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) => value && parseInt(String(value)))
  @IsPositive()
  pageNumber?: number;

  @IsOptional()
  @Transform(({ value }) => value && value === 'true')
  @IsBoolean()
  disablePagination?: boolean;
}

export class FieldsSpecificationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  omitFields?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  include?: string[];
}

export class SortSpecificationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sort?: string[];
}

export class SearchSpecificationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  searchType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];
}

export class QuerySpecificationDto extends IntersectionTypes(
  PaginationSpecificationDto,
  FieldsSpecificationDto,
  SortSpecificationDto,
  SearchSpecificationDto,
) {
  filter?: Record<string, any>;
}

/* Example Query Filter */
class QueryFilterDto {
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}

class FiltersSpecificationDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => QueryFilterDto)
  filter?: QueryFilterDto;
}

class IncludesSpecificationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  include?: string[];
}
