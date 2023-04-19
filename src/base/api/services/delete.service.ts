import { DeleteQueryBuilder, UpdateResult } from 'typeorm';

import { BaseEntity } from '@base/model';
import { EntityId } from 'typeorm/repository/EntityId';
import { IQueryOptions } from '@base/api/services/generic.service';
import { CreateOrUpdateService } from '@base/api/services/create-or-update.service';

/**
 * Base service class for NestJS projects.
 */
export class DeleteService<E extends BaseEntity> extends CreateOrUpdateService<E> {
  async softDelete(
    id: EntityId,
    deletedBy?: any,
    queryOptions?: IQueryOptions,
  ): Promise<UpdateResult> {
    await this.update(id, { deletedBy }, queryOptions);
    return this.repository.softDelete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFiltersDelete<T>(query: DeleteQueryBuilder<E>, dto?: T): DeleteQueryBuilder<E> {
    return query;
  }

  public async delete<T>(id: EntityId, dto?: T, queryOptions?: IQueryOptions): Promise<void> {
    let query = this.getQuery().delete();
    query = this.setFiltersDelete<T>(query, dto);
    query.andWhere(`${this.alias}.${this.options.idProperty} = :id`).setParameter('id', id);

    const deleteResult = await query.execute();
    if (!queryOptions?.doesThrow && deleteResult.affected === 0) throw this.notFound();
  }

  public async bulkDelete(ids: EntityId[]): Promise<void> {
    await this.getQuery().delete().where(`${this.alias}.id IN (:...ids)`, { ids }).execute();
  }
}
