import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket as _Socket } from 'socket.io';
import { Room } from 'socket.io-adapter';
import { Server } from 'socket.io';
import { LoggingService } from '@base/logging';

export class Socket extends _Socket {
  _room: Room;
  _rooms: Array<Room>;
}

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  readonly logger = new LoggingService().getLogger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.info('SocketGateway initialized');
  }

  handleConnection(client: Socket) {
    const address = client?.handshake?.address.split(':')?.pop();
    this.logger.info(`Client connected: ${client.id} (${address})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`);
  }

  async emitToRoom(room: string, topic: string, data: any) {
    this.server.to(room).emit(topic, data);
    this.server.emit(topic, data);
  }

  @SubscribeMessage('ping')
  protected pong() {
    return { event: 'ping', data: 'pong' };
  }

  @SubscribeMessage('msgToServer')
  protected onMsgToServer(client: Socket, payload: any) {
    const room = this.getRoom(client);
    return this.server.to(room).emit('msgToClient', payload);
  }

  @SubscribeMessage('join')
  protected async joinRoom(@ConnectedSocket() client: Socket, @MessageBody('room') room: string) {
    await client.join(room);
    return { event: 'join', data: { status: true } };
  }

  @SubscribeMessage('join-room')
  protected async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
  ): Promise<void> {
    client._room = room;
    await client.join(room);
    client.emit('join-room', { status: true });
  }

  @SubscribeMessage('leave-room')
  protected async onLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('room') room: string,
  ): Promise<void> {
    await client.leave(room);
    this.server.to(room).emit('left-room', { status: true });
  }

  protected getRoomsIter(client: Socket) {
    const rooms = client.rooms.values();
    rooms.next();
    return rooms;
  }

  protected getRoom(client: Socket): string {
    const rooms = this.getRoomsIter(client);
    return rooms.next().value;
  }
}
