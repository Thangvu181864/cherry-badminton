import { IsPositive, Max, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { config } from '@config';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsPositive()
  @Max(config.PAGINATION_PAGE_SIZE)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsPositive()
  page?: number;
}
