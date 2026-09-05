import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { NotificationPayload } from './interfaces/notification-payload.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: string };
      const header = client.handshake.headers.authorization;
      const token = auth.token || (header ? header.split(' ')[1] : undefined);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        orgId: string;
      }>(token);
      const userId = payload.sub;
      const orgId = payload.orgId;

      // Join rooms for targeted notifications
      await client.join(`user:${userId}`);
      await client.join(`org:${orgId}`);

      // Track presence
      const typedData = client.data as { userId?: string; orgId?: string };
      typedData.userId = userId;
      typedData.orgId = orgId;

      this.server.to(`org:${orgId}`).emit('presence:online', { userId, orgId });

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Org: ${orgId})`,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Connection failed: ${message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { userId, orgId } = client.data as {
      userId?: string;
      orgId?: string;
    };
    if (userId && orgId) {
      this.server
        .to(`org:${orgId}`)
        .emit('presence:offline', { userId, orgId });
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('presence:join-project')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const { userId } = client.data as { userId?: string };
    const room = `project:${data.projectId}`;

    await client.join(room);

    // Notify others in project
    this.server
      .to(room)
      .emit('presence:project-joined', { userId, projectId: data.projectId });

    // Return list of other users in project (approximate via room members)
    // In production, sync this with Redis
    return { success: true };
  }

  sendToUser(userId: string, payload: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', payload);
  }

  sendToOrganization(orgId: string, payload: NotificationPayload) {
    this.server.to(`org:${orgId}`).emit('notification', payload);
  }

  broadcast(payload: NotificationPayload) {
    this.server.emit('notification', payload);
  }
}
