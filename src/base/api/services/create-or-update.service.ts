import { instanceToPlain, plainToInstance } from 'class-transformer';

import { BaseEntity } from '@base/model';
import { IQueryOptions } from '@base/api/services/generic.service';
import { EntityId } from 'typeorm/repository/EntityId';
import { InsertResult } from 'typeorm';
import { ListService } from '@base/api/services/list.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * Base service class for NestJS projects.
 */
export class CreateOrUpdateService<E extends BaseEntity> extends ListService<E> {
  /* Create */
  async actionPreCreate<T>(dto: T): Promise<T> {
    return dto;
  }

  async actionPostCreate(entity: E): Promise<E> {
    return entity;
  }

  private async _insert<T>(dto: T, returning: string | string[] = '*'): Promise<InsertResult> {
    try {
      dto = await this.actionPreCreate<T>(dto);
      const plainDto = instanceToPlain(dto);
      const transformedDto = plainToInstance<QueryDeepPartialEntity<E>, QueryDeepPartialEntity<E>>(
        this.model,
        plainDto,
      );
      return await this.repository
        .createQueryBuilder()
        .insert()
        .values(transformedDto)
        .returning(returning)
        .execute();
    } catch (e) {
      this.handleDbError(e);
    }
  }

  async create<T>(dto: T, returning: string | string[] = '*'): Promise<E> {
    const insertResult = await this._insert(dto, returning);
    let ret = plainToInstance<E, E>(this.model, insertResult.raw)[0];
    ret = await this.actionPostCreate(ret);
    return ret;
  }

  async bulkCreate<T>(dto: T[], returning: string | string[] = '*'): Promise<E[]> {
    const insertResult = await this._insert(dto, returning);
    return plainToInstance<E, E>(this.model, insertResult.raw);
  }

  /* Update */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async actionPreUpdate<T, E>(dto: T, entity: E): Promise<T> {
    return dto;
  }

  async actionPostUpdate(entity: E): Promise<E> {
    return entity;
  }

  async update<T>(id: EntityId, dto: T, queryOptions?: IQueryOptions): Promise<E> {
    try {
      const entity = await this.getById(id, queryOptions);
      dto = await this.actionPreUpdate<T, E>(dto, entity);
      Object.assign(entity, dto);
      const ret = await entity.save();
      return this.actionPostUpdate(ret);
    } catch (e) {
      this.handleDbError(e);
    }
  }
}
