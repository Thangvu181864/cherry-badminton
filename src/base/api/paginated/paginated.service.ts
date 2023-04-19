import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMeta {
  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  currentPage: number;

  [s: string]: any;
}

export class PaginatedResult<TData, TMeta = PaginatedMeta> {
  @ApiProperty()
  meta: TMeta;

  @ApiProperty()
  data: TData[];
}

export type ListOrPageResult<TData> = PaginatedResult<TData> | TData[];
