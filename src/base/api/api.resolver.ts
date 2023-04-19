import { LoggingService } from '@base/logging';

import { BusinessException, SYSTEM_ERROR } from '@base/api/exception';
import { Payload } from '@base/api/api.schemas';

export class ApiResolver {
  constructor(protected loggingService: LoggingService) {}
  logger = this.loggingService.getLogger('api-resolve');

  /**
   * try catch a func
   * @param func function need try
   * @param excPayload
   * @return {Payload}:
   * + true: result = result of function
   * + false: result = null
   * @example
   * export class MyResolver extends BaseResolver {
   *   this.try(() => async {
   *     return data
   *   })
   * }
   */
  async try<T>(func: () => Promise<T>, excPayload: Payload<any> = {}): Promise<T> {
    try {
      return func();
    } catch (e) {
      this.logger.error(e.message);
      throw e.errorCode
        ? e
        : new BusinessException<null>({
            errorCode: SYSTEM_ERROR,
            ...excPayload,
          });
    }
  }

  /**
   * try catch a task <TaskEither>
   * @param task
   * @return:
   * + fail: null
   * + success: data been returned from func
   * @example
   * export class MyResolver extends BaseResolver {
   *   this.resolveNullableTask(() =>
   *     pipe(
   *        taskEither.right(),
   *        taskEither.chain()
   *     )
   *   )
   * }
   */
  // resolveNullableTask = async <T>(task: TaskEither<ReturnError, T>): Promise<T | null> => {
  //   try {
  //     return await fold<ReturnError, T, T | null>(
  //       (e: any) => async () => {
  //         this.logger.debug(e.message);
  //         return null;
  //       },
  //       (a) => async () => a
  //     )(task)();
  //   } catch (e) {
  //     this.logger.error(e);
  //     return null;
  //   }
  // };
  //
  // /**
  //  * try catch a TaskEither
  //  * @param task
  //  * @return object {Payload<T>}
  //  * + fail: {ERROR_MESSAGE}
  //  * + success: {SUCCESS_MESSAGE, result}
  //  * @example
  //  * export class MyResolver extends BaseResolver {
  //  *   this.resolvePayloadTask(() =>
  //  *     flow(
  //  *        taskEither.right(),
  //  *        taskEither.chain()
  //  *     )
  //  *   )
  //  * }
  //  */
  // resolvePayloadTask = async <T>(task: TaskEither<ReturnError, T>): Promise<Payload<T>> => {
  //   try {
  //     return await fold(
  //       (error: ReturnError) => async () => {
  //         this.logger.debug(error.message);
  //         return {
  //           success: false,
  //           errorCode: error.errorCode,
  //           message: error.message,
  //           result: error.result,
  //         } as Payload<T>;
  //       },
  //       (a: T) => async () => ({
  //         success: true,
  //         message: SUCCESS_MESSAGE,
  //         result: a,
  //       })
  //     )(task)();
  //   } catch (e) {
  //     this.logger.error(e);
  //     const error: ReturnError = new ReturnError(SYSTEM_ERROR);
  //     return {
  //       success: false,
  //       errorCode: error.errorCode,
  //       message: error.message,
  //       result: null,
  //     };
  //   }
  // };
}
