import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AutoGuardService {
  private readonly logger = new Logger(AutoGuardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Proactive Security: Analyzes real-time audit logs for anomalies.
   * If a sudden spike in failed operations or suspicious logins occurs,
   * it automatically triggers the Organization Lockdown (Panic Button).
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorAnomalies() {
    this.logger.log('Starting Real-time Anomaly Scan (Auto-Guard Sentinel)...');

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1. Group recent suspicious activities by organization
    const anomalies = await this.prisma.auditLog.groupBy({
      by: ['organizationId'],
      where: {
        timestamp: { gte: oneMinuteAgo },
        action: {
          in: ['FAILED_LOGIN', 'UNAUTHORIZED_ACCESS', 'RATE_LIMIT_HIT'],
        },
      },
      _count: true,
    });

    for (const anomaly of anomalies) {
      // 2. Threshold check: 10 failures in 1 minute = Immediate Lockdown
      if (anomaly._count > 10) {
        this.logger.error(
          `Suspicious activity spike detected for Org: ${anomaly.organizationId}. Triggering AUTO-LOCKDOWN.`,
        );

        await this.prisma.organization.update({
          where: { id: anomaly.organizationId },
          data: {
            isLocked: true,
            lockedAt: new Date(),
            settings: {
              lockdown_reason:
                'Automated AI Response: High-frequency anomaly detected.',
              lockdown_ref: `SENTINEL-${Date.now()}`,
            },
          },
        });

        // 3. Proactively log the defense action
        await this.prisma.auditLog.create({
          data: {
            action: 'AUTO_LOCKDOWN_TRIGGERED',
            resource: 'Organization',
            resourceId: anomaly.organizationId,
            organizationId: anomaly.organizationId,
            details: {
              count: anomaly._count,
              window: '1m',
              reason: 'High-frequency failures',
            },
          },
        });
      }
    }
  }
}
