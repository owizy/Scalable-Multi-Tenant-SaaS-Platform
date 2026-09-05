import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'node:crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhookQueue: Queue,
  ) {}

  async createEndpoint(
    orgId: string,
    data: { url: string; name?: string; events: string[] },
  ) {
    return this.prisma.webhookEndpoint.create({
      data: {
        ...data,
        organizationId: orgId,
        secret: crypto.randomBytes(32).toString('hex'),
      },
    });
  }

  async findAllEndpoints(orgId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { organizationId: orgId },
    });
  }

  async dispatch(
    orgId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    // Find active endpoints for this org and event
    const endpoints = await this.prisma.webhookEndpoint.findMany({
      where: {
        organizationId: orgId,
        isActive: true,
        events: { has: event },
      },
    });

    for (const endpoint of endpoints) {
      await this.webhookQueue.add('dispatch-webhook', {
        endpointId: endpoint.id,
        url: endpoint.url,
        secret: endpoint.secret,
        event,
        payload,
      });
    }

    if (endpoints.length > 0) {
      this.logger.log(
        `Dispatched ${event} to ${endpoints.length} endpoints for org ${orgId}`,
      );
    }
  }

  async testTarget(url: string, secret: string) {
    const payload = {
      event: 'test.webhook',
      timestamp: new Date(),
      test: true,
      message:
        'This is a test notification from the Multi-Tenant SaaS platform.',
    };

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
          'X-Hook-Event': 'test.webhook',
        },
        body: JSON.stringify(payload),
      });

      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        body: await response.text(),
      };
    } catch (e: unknown) {
      return {
        error: e instanceof Error ? e.message : 'Unknown error',
        ok: false,
      };
    }
  }
}
