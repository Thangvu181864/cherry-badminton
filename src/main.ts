import { NestFactory } from '@nestjs/core';
import { ValidationError as NestValidationError } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as express from 'express';
import * as admin from 'firebase-admin';

import { config } from '@config';
import { LoggingService } from '@base/logging';
import { ValidationError } from '@base/api/exception';
import { initSwagger } from '@base/docs';
import { initQueueBoard } from '@base/queue';
import {
  ValidationPipe,
  HttpExceptionFilter,
  UnknownExceptionsFilter,
  ResponseTransformInterceptor,
  useMorgan,
} from '@base/middleware';
import { RedisIoAdapter } from '@base/socket/redis.adapter';
import { AppModule } from '@app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  const redisIoAdapter = new RedisIoAdapter(app);
  const loggingService = app.get(LoggingService);
  const logger = loggingService.getLogger();

  await redisIoAdapter.connectToRedis();

  admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY,
      }),
    },
    config.FIREBASE_APP_NAME,
  );

  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors(config.CORS);
  app.setGlobalPrefix(config.API_NAMESPACE);
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(rateLimit(config.RATE_LIMIT));
  app.use(useMorgan(loggingService.logger.access));

  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new UnknownExceptionsFilter(loggingService));
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: NestValidationError[] = []) =>
        new ValidationError(validationErrors),
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  initializeTransactionalContext();
  initSwagger(app);
  initQueueBoard(app);
  app.use(helmet());
  app.use('/favicon.ico', express.static(config.STATIC_PATH + '/favicon.ico'));
  app.use(`/${config.UPLOAD_PATH}`, express.static(config.UPLOAD_PATH));
  await app.listen(config.PORT);
  const hostname = config.HOST;
  logger.info('Server time: ' + new Date().toString());
  logger.info(`Local/public ip: ${String(config.LOCAL_IP)} - ${String(config.PUBLIC_IP)}`);
  logger.info(`Running app on: ${hostname}`);
  logger.info(`Api Document v1: ${hostname}/${config.SWAGGER_NAMESPACE}`);
  logger.info(`Api gateway v1: ${hostname}/${config.API_NAMESPACE}`);
  logger.info(`Socket gateway: ${hostname}/${config.SOCKET_NAMESPACE}`);
  logger.info(`Queue board: ${hostname}/${config.QUEUE_BOARD_NAMESPACE}`);
}

void bootstrap();
