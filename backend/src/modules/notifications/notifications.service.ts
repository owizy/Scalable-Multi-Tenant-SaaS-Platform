import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationPayload } from './interfaces/notification-payload.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  async notifyUser(
    userId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    this.logger.log(`Notifying User: ${userId} -> ${payload.message}`);

    // 1. WebSocket Push
    this.gateway.sendToUser(userId, payload);

    // 2. Email (Mock)
    await Promise.resolve();
  }

  async notifyOrganization(
    orgId: string,
    payload: NotificationPayload,
  ): Promise<void> {
    this.logger.log(`Notifying Organization: ${orgId} -> ${payload.message}`);

    // Broadcast via WebSockets
    this.gateway.sendToOrganization(orgId, payload);
    await Promise.resolve();
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Phase 3: Integration with Resend/SendGrid
    this.logger.log(`Mock Email sent to ${to}: [${subject}] ${body}`);
    await Promise.resolve();
  }

  // Simplified broadcast
  async broadcast(payload: NotificationPayload): Promise<void> {
    this.gateway.broadcast(payload);
    await Promise.resolve();
  }
}
