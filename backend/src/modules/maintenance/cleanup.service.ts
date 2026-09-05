import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class GdprCleanupService {
  private readonly logger = new Logger(GdprCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeFrozenOrganizations() {
    this.logger.log('Starting Daily GDPR Cleanup (Purging Frozen Data)...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const frozenOrgs = await this.prisma.organization.findMany({
      where: {
        isFrozen: true,
        frozenAt: { lte: thirtyDaysAgo },
      },
    });

    for (const org of frozenOrgs) {
      this.logger.warn(
        `Purging Organization: ${org.name} (GDPR-30D Violation)`,
      );

      // Deleting all related data (Prisma Cascades handle most of this)
      await this.prisma.organization.delete({
        where: { id: org.id },
      });

      this.logger.log(`Successfully Purged Organization: ${org.name}. RIP.`);
    }
  }

  async freezeOrganization(orgId: string) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: { isFrozen: true, frozenAt: new Date() },
    });
  }
}
