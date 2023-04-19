import { Global, Module } from '@nestjs/common';
import { SocketGateway } from '@base/socket/socket.gateway';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
