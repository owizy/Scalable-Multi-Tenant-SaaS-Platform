import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SecurityAuditorService {
  private readonly logger = new Logger(SecurityAuditorService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runAudit() {
    this.logger.log('Starting Daily Security Audit...');
    const organizations = await this.prisma.organization.findMany();

    for (const org of organizations) {
      const issues: string[] = [];

      // 1. Check for missing 2FA
      const usersWithout2FA = await this.prisma.user.count({
        where: { organizationId: org.id, isTwoFactorEnabled: false },
      });
      if (usersWithout2FA > 0) {
        issues.push(`${usersWithout2FA} users do not have 2FA enabled.`);
      }

      // 2. Check for Inactive Users (> 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const inactiveUsers = await this.prisma.user.count({
        where: { organizationId: org.id, updatedAt: { lt: ninetyDaysAgo } },
      });
      if (inactiveUsers > 0) {
        issues.push(
          `${inactiveUsers} users have been inactive for over 90 days.`,
        );
      }

      // 3. Log findings
      if (issues.length > 0) {
        await this.prisma.auditLog.create({
          data: {
            action: 'SECURITY_AUDIT_REPORT',
            resource: 'Organization',
            resourceId: org.id,
            organizationId: org.id,
            details: { issues, timestamp: new Date() },
          },
        });
      }
    }
    this.logger.log('Daily Security Audit Completed.');
  }
}
