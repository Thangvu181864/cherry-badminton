import * as customEnv from 'custom-env';
import * as ms from 'ms';
import * as ip from 'ip';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { DEFAULT_CACHE_LONG_TIMEOUT, DEFAULT_CACHE_TIMEOUT } from '@config/config.constants';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'dev';
const customEnvName = process.env.DOT_ENV_SUFFIX ?? process.env.NODE_ENV;
console.log('Using NODE_ENV: ' + process.env.NODE_ENV);
console.log('Using customEnvName: ' + customEnvName);
customEnv.env(customEnvName);
const _process = { env: process.env };
process.env = {};

@Injectable()
export class ConfigService {
  // COMMON
  DEV = 'dev';
  TEST = 'test';
  PROD = 'prod';
  JEST = 'jest';
  DEBUG = (_process.env.DEBUG ?? 'false').toLowerCase() !== 'false';
  NODE_ENV = _process.env.NODE_ENV;
  INSTANCE_ID = _process.env.INSTANCE_ID ?? 0;
  PAGINATION_PAGE_SIZE = parseInt(_process.env.PAGINATION ?? '250', 10);

  // SPECIAL
  SR = {
    PRODUCT_NAME: _process.env.PRODUCT_NAME ?? 'Monorepo',
    VERSION: _process.env.VERSION ?? 'v1.0',
    SIGNATURE: 'Develop Team',
    SOCIAL: {
      FACEBOOK_URL: 'https://www.facebook.com',
    },
    SUPPORT: {
      URL: 'https://domain/lien-he/',
      EMAIL: 'hotro@domain.vn',
    },
  };

  // DIR
  ROOT_PATH = path.resolve('.');
  STATIC_PATH = 'static';
  UPLOAD_PATH = _process.env.UPLOAD_PATH ?? 'uploads';
  BACKUP_PATH = _process.env.BACKUP_PATH ?? 'backups';

  // NETWORK
  LOCAL_IP: string = ip.address();
  PUBLIC_IP: string = _process.env.PUBLIC_IP ?? this.LOCAL_IP;
  PORT: number = +_process.env.PORT;
  HOST = `http://${this.PUBLIC_IP}:${this.PORT}`;
  DOMAIN = _process.env.DOMAIN ?? this.HOST;
  API_NAMESPACE = _process.env.API_NAMESPACE ?? 'api/v1';
  SWAGGER_NAMESPACE = _process.env.SWAGGER_NAMESPACE ?? 'api-docs';
  QUEUE_BOARD_NAMESPACE = _process.env.QUEUE_BOARD_NAMESPACE ?? 'queues';
  SOCKET_NAMESPACE: string = _process.env.SOCKET_NAMESPACE ?? 'socket';
  API_DOC_URL = '';

  // MIDDLEWARE
  FIXED_STATUS_CODE = (_process.env.SENTRY_LOG ?? 'true').toLowerCase() === 'true';
  RATE_LIMIT = {
    windowMs: 60 * 1000,
    max: parseInt(_process.env.RATE_LIMIT_MIN, 10) || 120,
  };
  CORS: CorsOptions = {
    origin: true,
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders:
      'content-type, authorization, accept-encoding, user-agent, accept, cache-control, connection, cookie',
    exposedHeaders: 'X-RateLimit-Reset, set-cookie, Content-Disposition, X-File-Name',
  };
  UPLOAD_LIMIT_SIZE = parseInt(_process.env.UPLOAD_LIMIT_SIZE, 10) || 50 * 1024 * 1024; // 50MB

  // DB
  DB_TYPE = _process.env.DB_TYPE ?? 'postgres';
  DB_HOST = _process.env.DB_HOST ?? '127.0.0.1';
  DB_PORT = parseInt(_process.env.DB_PORT ?? '5432', 10);
  DB_USERNAME = _process.env.DB_USERNAME ?? 'postgres';
  DB_PASSWORD = _process.env.DB_PASSWORD ?? '';
  DB_DATABASE = _process.env.DB_DATABASE ?? '';
  DB_TIMEZONE = _process.env.DB_TIMEZONE ?? 'Asia/Ho_Chi_Minh';

  REDIS_HOST = _process.env.REDIS_HOST ?? '127.0.0.1';
  REDIS_PORT = parseInt(_process.env.REDIS_PORT ?? '6379', 10);
  REDIS_PASSWORD = _process.env.REDIS_PASSWORD ?? '';
  REDIS_STORAGE = {
    // 0 ~ 15
    DATABASE: 0,
    SOCKET: 1,
    QUEUE: 2,
    GLOBAL: 3,
    SETTING: 4,
    AUTH: 5,
  };

  CACHE_TIMEOUT = ms(_process.env.CACHE_TIMEOUT ?? DEFAULT_CACHE_TIMEOUT);
  CACHE_LONG_TIMEOUT = ms(_process.env.CACHE_LONG_TIMEOUT ?? DEFAULT_CACHE_LONG_TIMEOUT);
  CACHE_SETTING_TIMEOUT = 0;
  CACHE_DB_TIMEOUT = ms('5s');

  // USER
  PASSWORD_SALT = parseInt(_process.env.PASSWORD_SALT ?? '10', 10);
  ACCESS_SECRET = _process.env.ACCESS_SECRET ?? 'access-super-secret';
  ACCESS_TOKEN_EXP = _process.env.ACCESS_TOKEN_EXP ?? '7d';
  REFRESH_SECRET = _process.env.REFRESH_SECRET ?? 'refresh-super-secret';
  REFRESH_TOKEN_EXP = _process.env.REFRESH_TOKEN_EXP ?? '30d';
  OTP_SECRET = _process.env.OTP_SECRET ?? 'super-secret';
  OTP_OPTION = {
    digits: 6,
    step: 60,
    window: 3, // total time = step * window (sec)
  };
  BEARER_TEST = {};

  // MAIL
  EMAIL_USE_TLS = (_process.env.EMAIL_USE_TLS ?? 'true').toLowerCase() === 'true';
  EMAIL_HOST = _process.env.EMAIL_HOST ?? 'smtp.gmail.com';
  EMAIL_USER = _process.env.EMAIL_USER ?? '';
  EMAIL_PASSWORD = _process.env.EMAIL_PASSWORD ?? '';
  EMAIL_SERVICE = _process.env.EMAIL_SERVICE ?? 'gmail';
  EMAIL_PORT = parseInt(_process.env.EMAIL_PORT ?? '587', 10);

  // AWS_S3
  AWS_S3_ENDPOINT = _process.env.AWS_S3_ENDPOINT ?? '';
  AWS_S3_REGION = _process.env.AWS_S3_REGION ?? '';
  AWS_S3_ACCESS_KEY = _process.env.AWS_S3_ACCESS_KEY ?? '';
  AWS_S3_ACCESS_SECRET = _process.env.AWS_S3_ACCESS_SECRET ?? '';
  AWS_S3_EXPIRE_TIME = parseInt(_process.env.AWS_S3_EXPIRE_TIME ?? '90', 10);
  AWS_S3_BUCKET = _process.env.AWS_S3_BUCKET ?? 'bucket';

  // FIREBASE
  FIREBASE_APP_NAME = _process.env.FIREBASE_APP_NAME ?? 'app-me';
  FIREBASE_PROJECT_ID = _process.env.FIREBASE_PROJECT_ID ?? '';
  FIREBASE_PRIVATE_KEY = String(_process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n') ?? '';
  FIREBASE_CLIENT_EMAIL = _process.env.FIREBASE_CLIENT_EMAIL ?? '';

  // SCHEDULE
  SCHEDULE_ENABLE = (_process.env.SCHEDULE_ENABLE ?? 'true').toLowerCase() === 'true';

  // BACKUP
  BACKUP_DB_ENABLE = (_process.env.BACKUP_DB_ENABLE ?? 'true').toLowerCase() === 'true';
}

export const config = new ConfigService();
