import { SelectQueryBuilder } from 'typeorm';
import { QuerySpecificationDto } from '@base/api/dto/query-specification.dto';
import { config } from '@config';

type SortDirection = 'ASC' | 'DESC';

export class FetchUtils {
  static processFetchSpecification<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    {
      fields,
      omitFields,
      include,
      filter,
      pageNumber = 1,
      pageSize = config.PAGINATION_PAGE_SIZE,
      disablePagination = false,
      sort,
      search,
    }: QuerySpecificationDto = {
      fields: undefined,
      omitFields: undefined,
      include: undefined,
      filter: undefined,
      pageNumber: 1,
      pageSize: config.PAGINATION_PAGE_SIZE,
      disablePagination: false,
      sort: undefined,
    },
  ) {
    const queryWithIncludedEntities = this.addIncludedEntities(query, aliasTable, { include });
    const queryWithSparseFieldsets = this.addFields(queryWithIncludedEntities, aliasTable, {
      fields,
    });
    const queryWithSorting = this.addSorting(queryWithSparseFieldsets, aliasTable, { sort });
    const queryWithPagination = disablePagination
      ? queryWithSorting
      : this.addPagination(queryWithSorting, aliasTable, {
          pageNumber,
          pageSize,
        });

    return queryWithPagination;
  }

  /**
   * Wrapper over processFetchSpecification(), for single entities.
   */
  static processSingleEntityFetchSpecification<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    {
      fields = undefined,
      omitFields = undefined,
      include = undefined,
      filter = undefined,
    }: Pick<QuerySpecificationDto, 'fields' | 'omitFields' | 'include' | 'filter'> = {
      fields: undefined,
      omitFields: undefined,
      include: undefined,
      filter: undefined,
    },
  ) {
    return this.processFetchSpecification(query, aliasTable, {
      fields,
      omitFields,
      include,
      filter,
      disablePagination: true,
      pageNumber: undefined,
      pageSize: undefined,
    });
  }

  static addFields<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    { fields }: { fields: string[] },
  ): SelectQueryBuilder<T> {
    if (fields?.length > 0) {
      query.select(fields.map((f) => `${aliasTable}.${f}`));
    }

    return query;
  }

  static addIncludedEntities<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    { include }: { include: string[] },
  ) {
    /**
     * Select entities to be included as per fetch specification.
     */
    if (include && include.length > 0) {
      include.forEach((inc) => {
        const parts = inc.split('.');
        let lastPart: string = null;
        let completed = '';
        if (parts.length > 1) {
          parts.forEach((element, index) => {
            if (index > 0) {
              completed += '.';
            }
            completed += element;
            const alias = completed.replace('.', '_');
            if (include.indexOf(completed) === -1 || completed === inc) {
              if (index === 0) {
                query.leftJoinAndSelect(`${aliasTable}.${element}`, alias);
              } else {
                query.leftJoinAndSelect(`${lastPart}.${element}`, alias);
              }
            }

            lastPart = alias;
          });
        } else {
          query.leftJoinAndSelect(`${aliasTable}.${inc}`, inc);
        }
      });
    }
    return query;
  }

  static addSorting<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    { sort = undefined }: { sort: string[] },
  ) {
    if (sort) {
      sort.map((s) => {
        const sortByColumn = s.replace(/^[+-]/, '');
        // if the first character is '-', sort descending; otherwise, sort ascending
        const sortDirection: SortDirection = RegExp(/^-/).exec(s) ? 'DESC' : 'ASC';
        query.addOrderBy(`${aliasTable}.${sortByColumn}`, sortDirection);
      });
    }

    return query;
  }

  static addPagination<T>(
    query: SelectQueryBuilder<T>,
    aliasTable: string,
    { pageSize, pageNumber }: { pageSize: number; pageNumber: number },
  ) {
    query.take(pageSize);
    query.skip(pageSize * (pageNumber - 1));
    return query;
  }
}
