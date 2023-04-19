export const defaultPayload = {
  success: true,
  errorCode: '000000',
  message: '',
  data: null,
  meta: {},
};

export abstract class Payload<TData> {
  success?: boolean;
  errorCode?: string;
  message?: string;
  data?: TData | null;

  constructor(partial: Payload<TData>) {
    Object.assign(this, partial);
  }
}

export class NullPayload extends Payload<null> {}
export class StringPayload extends Payload<string> {}
export class ObjectPayload extends Payload<Record<string, unknown>> {}
export class ArrayPayload extends Payload<[]> {}
