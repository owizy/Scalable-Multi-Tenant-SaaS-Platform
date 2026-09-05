import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as crypto from 'node:crypto';

@Processor('webhooks')
export class WebhooksWorker extends WorkerHost {
  private readonly logger = new Logger(WebhooksWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<{
      endpointId: string;
      url: string;
      secret: string;
      event: string;
      payload: Record<string, unknown>;
    }>,
  ): Promise<void> {
    const { endpointId, url, secret, event, payload } = job.data;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hook-Signature': signature,
          'X-Hook-Event': event,
          'User-Agent': 'MultiTenantSaaS-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();

      // Log delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: endpointId,
          event,
          payload: payload as any,
          responseStatus: response.status,
          responseBody: responseBody.slice(0, 500), // Limit size
          isSuccess: response.ok,
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      this.logger.log(`Successfully delivered ${event} to ${url}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to deliver ${event} to ${url}: ${errorMessage}`,
      );

      // Log failed delivery
      await this.prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: endpointId,
          event,
          payload: payload as any,
          responseBody: errorMessage,
          isSuccess: false,
        },
      });

      throw error; // Let BullMQ retry
    }
  }
}
