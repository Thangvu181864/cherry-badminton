import { Injectable } from '@nestjs/common';
import { BaseEntity } from '@base/model';
import { DeleteService } from '@base/api/services/delete.service';

export { IServiceOptions, IQueryOptions } from '@base/api/services/generic.service';

/**
 * Base service class for NestJS projects.
 */
@Injectable()
export class BaseCrudService<E extends BaseEntity> extends DeleteService<E> {}
