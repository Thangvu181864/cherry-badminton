import { getConnection, Repository, SelectQueryBuilder } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { Logger } from 'log4js';

import * as HttpExc from '@base/api/exception';
import { BaseEntity, INotFound } from '@base/model';
import { EntityId } from 'typeorm/repository/EntityId';
import { QueryDbError } from '@base/db/db.constant';

export interface IServiceOptions {
  idProperty?: string;
  sort?: string[];
}

export interface IQueryOptions {
  doesThrow?: boolean;
}

/**
 * Base service class for NestJS projects.
 */
export class GenericService<E extends BaseEntity> {
  protected readonly options: IServiceOptions;
  private readonly defaultOptions: IServiceOptions = {
    idProperty: 'id',
    sort: ['-id'],
  };

  constructor(
    protected readonly model,
    protected readonly repository: Repository<E>,
    protected readonly alias: string = 'base',
    protected readonly logger: Logger,
    protected readonly serviceOptions?: IServiceOptions,
  ) {
    this.options = Object.assign(this.defaultOptions, serviceOptions);
  }

  /* Repository */
  public getRepository(): Repository<E> {
    return this.repository;
  }

  getQuery(alias: string = this.alias): SelectQueryBuilder<E> {
    return this.repository.createQueryBuilder(alias);
  }

  find(options?: FindOneOptions<E>): Promise<E[]> {
    return this.repository.find(
      Object.assign({ order: { [this.options.idProperty]: 'DESC' } }, options),
    );
  }

  /* Handle */
  protected getName(): string {
    return this.alias.replace(/^\w/, (c) => c.toUpperCase());
  }

  notFound<TData>(payload?: INotFound<TData>): HttpExc.NotFound<TData> {
    return new HttpExc.NotFound<TData>({
      errorCode: this.alias.toUpperCase() + HttpExc.NOT_FOUND,
      message: this.getName() + ' not found',
      ...payload,
    });
  }

  protected handleDbError(error: any) {
    switch (error.code) {
      case QueryDbError.UNIQUE_VIOLATION:
        throw new HttpExc.QueryDbError({
          errorCode: this.alias.toUpperCase() + HttpExc.DUPLICATE,
          message: error?.detail.replace(/['"()-]/gi, ''),
        });

      case QueryDbError.SYNTAX_ERROR:
        this.logger.error(error);
        throw new HttpExc.QueryDbError({
          errorCode: this.alias.toUpperCase() + HttpExc.QUERY_DB_ERROR,
          message: 'Syntax error',
        });

      case QueryDbError.INVALID_TEXT_REPRESENTATION:
        this.logger.error(error);
        throw new HttpExc.QueryDbError({
          errorCode: this.alias.toUpperCase() + HttpExc.QUERY_DB_ERROR,
          message: 'Invalid text input params',
        });

      case QueryDbError.FOREIGN_KEY_VIOLATION:
        this.logger.error(error);
        throw new HttpExc.QueryDbError({
          errorCode: this.alias.toUpperCase() + HttpExc.PROTECTED,
          message: 'The data is protected, please delete the relevant data first',
        });

      default:
        throw error;
    }
  }

  returningColumns(excludeColumns?: string[]): string[] {
    return GenericService.returningColumns(this.model, excludeColumns);
  }

  static returningColumns(entity, excludeColumns?: string[]): string[] {
    const columns = getConnection()
      .getMetadata(entity)
      .ownColumns.map((column) => column.propertyName);
    if (excludeColumns) return columns.filter((item) => !excludeColumns.includes(item));
    return columns;
  }

  /* Retrieve */
  async getEntity(id: EntityId, queryOptions?: IQueryOptions): Promise<E> {
    const query = this.getQuery();
    query.andWhere(`${this.alias}.${this.options.idProperty} = :id`).setParameter('id', id);

    const entity = await query.getOne().catch((e) => this.handleDbError(e));
    if (entity) return entity;

    if (!queryOptions?.doesThrow) throw this.notFound();
  }

  async getById(id: EntityId, queryOptions?: IQueryOptions): Promise<E> {
    return this.getEntity(id, queryOptions);
  }
}
