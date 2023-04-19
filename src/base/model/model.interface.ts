import { Payload } from '@base/api/api.schemas';

export interface INotFound<TData> extends Payload<TData> {
  doesThrow?: boolean;
}
