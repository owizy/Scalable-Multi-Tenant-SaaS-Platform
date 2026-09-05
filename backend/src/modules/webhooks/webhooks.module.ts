import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksService } from './webhooks.service';
import { WebhooksWorker } from './webhooks.worker';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'webhooks',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    }),
  ],
  providers: [WebhooksService, WebhooksWorker],
  exports: [WebhooksService],
})
export class WebhooksModule {}
