import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// GLOBAL
import { ConfigModule } from '@config';
import { ScheduleModule } from '@base/schedule/schedule.module';
import { LoggingModule } from '@base/logging/logging.module';
import { RedisModule } from '@base/db/redis';
import { MemcachedModule } from '@base/db/cache/memcached.module';
import { QueueModule } from '@base/queue/queue.module';
import { SocketModule } from '@base/socket/socket.module';

// CORE
import { DatabaseModule } from '@base/db/db.module';
import { MailModule } from '@base/mail/mail.module';
import { HealthModule } from '@base/health/health.module';

// APP
import { SeederModule } from '@migrations/seed';
import { UserModule } from '@modules/user';
import { AuthModule, JwtAuthModule, JwtAuthGuard } from '@modules/auth';
import { NotificationModule } from '@modules/notification';

const globalModule = [
  ConfigModule,
  LoggingModule,
  RedisModule,
  MemcachedModule,
  QueueModule,
  ScheduleModule,
  SocketModule,
];

const coreModules = [DatabaseModule, MailModule, HealthModule];

const appModules = [UserModule, AuthModule, JwtAuthModule, SeederModule, NotificationModule];

@Module({
  imports: [...globalModule, ...coreModules, ...appModules],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
