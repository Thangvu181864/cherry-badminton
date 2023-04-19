import { Logger, QueryRunner } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { configure, getLogger, Appender, Layout, Logger as FourLogger } from 'log4js';

import { config } from '@config';
import { QueryDbError } from '@base/db/db.constant';

const layouts: Record<string, Layout> = {
  console: {
    type: 'pattern',
    pattern: '%-6p %d %25.25f{2}:%-4.-4l| %[%.6000m (%c)%]',
  },
  dateFile: {
    type: 'pattern',
    pattern: '%-6p %d %25.25f{2}:%-4.-4l| %m (%c)',
  },
  access: {
    type: 'pattern',
    pattern: 'ACCESS %d %28.28x{remoteAddr}  | %x{access} (%c)',
    tokens: {
      remoteAddr: function (logEvent) {
        let remoteAddr = logEvent.data.toString().split(' ', 1).pop();
        remoteAddr = remoteAddr.replace(/^.*:/, '');
        remoteAddr = remoteAddr === '1' ? '127.0.0.1' : remoteAddr;
        return remoteAddr;
      },
      access: function (logEvent) {
        const [, ...data] = logEvent.data.toString().split(' ');
        data.pop();
        return data.join(' ');
      },
    },
  },
};

const appenders: Record<string, Appender> = {
  console: {
    type: 'console',
    layout: layouts.console,
  },
  dateFile: {
    type: 'dateFile',
    filename: 'logs/out',
    pattern: 'yyyy-MM-dd.log',
    alwaysIncludePattern: true,
    keepFileExt: true,
    numBackups: 7,
    layout: layouts.dateFile,
  },
  access: {
    type: 'console',
    layout: layouts.access,
  },
};

class DbLogger implements Logger {
  constructor(private logger: FourLogger) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.debug(
      `query=${query}` + (parameters ? ` parameters=${JSON.stringify(parameters)}` : ``),
    );
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: Error & { code: string },
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.debug(error);
    const errorMessage = error.message ? error.message : error;
    if (Object.values(QueryDbError).includes(error?.code)) return this.logger.warn(errorMessage);

    this.logger.error(errorMessage);
    this.logger.error(`query=${query} parameters=${JSON.stringify(parameters)}`);
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.warn(`time=${time} query=${query} parameters=${JSON.stringify(parameters)}`);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {}

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): any {}

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.logger[level](message);
  }
}

@Injectable()
export class LoggingService {
  /**
   * config logging
   * ________________________________________
   * | NODE_ENV | DEBUG true  | DEBUG false |
   * ---------------------------------------=
   * | dev      | debug       | info        |
   * | test     | debug       | off         |
   * | product  | info        | info        |
   * ----------------------------------------
   */
  constructor() {
    const isTesting = config.NODE_ENV === config.TEST;
    const isDev = config.NODE_ENV === config.DEV;
    const level = config.DEBUG ? 'debug' : 'info';

    configure({
      appenders: appenders,
      categories: {
        default: {
          appenders: ['console', 'dateFile'],
          level: level,
          enableCallStack: true,
        },
        access: {
          appenders: ['access', 'dateFile'],
          level: 'info',
          enableCallStack: true,
        },
      },
    });
  }

  getLogger = getLogger;

  private _access = () => {
    const logger = this.getLogger('access');
    return {
      write: logger.info.bind(logger),
    };
  };

  logger = {
    default: getLogger('default'),
    access: this._access(),
    thirdParty: getLogger('thirdParty'),
  };

  getDbLogger(category: string) {
    return new DbLogger(this.getLogger(category));
  }
}
