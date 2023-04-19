import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

import { config } from '@config';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger('SocketGateway');

  private adapterConstructor: ReturnType<typeof createAdapter>;

  create(port: number, options?: any): any {
    options.namespace = `/${config.SOCKET_NAMESPACE}${options?.namespace ?? ''}`;
    this.logger.log(`Mapped {${options.namespace}, SOCKET} route`);
    return super.create(port, options);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
      database: config.REDIS_STORAGE.SOCKET,
      password: config.REDIS_PASSWORD,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
