import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module';
import { WhatsAppGateway } from './whatsapp.gateway';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, AiModule],
  providers: [NotificationsService, NotificationsGateway, WhatsAppGateway],
  exports: [NotificationsService, NotificationsGateway, WhatsAppGateway],
})
export class NotificationsModule {}
