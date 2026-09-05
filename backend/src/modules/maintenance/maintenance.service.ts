import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../infrastructure/storage/storage.provider';
import type { StorageProvider } from '../../infrastructure/storage/storage.provider';
import { ReportingService } from '../reporting/reporting.service';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly reporting: ReportingService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTrashCleanup() {
    this.logger.log('Starting daily trash cleanup...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Dynamic deletion for multiple models (example: Project)
    const result = await this.prisma.project.deleteMany({
      where: {
        deletedAt: { lt: thirtyDaysAgo },
      },
    });

    this.logger.log(
      `Cleanup complete. Permanently deleted ${result.count} old trashed projects.`,
    );
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async handleAuditArchival() {
    this.logger.log('Starting weekly audit log archival...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldLogs = await this.prisma.auditLog.findMany({
      where: { timestamp: { lt: ninetyDaysAgo } },
      include: { user: true },
    });

    if (oldLogs.length === 0) return;

    // Convert to CSV logic (Simplified for demonstration)
    const csvContent = oldLogs
      .map((l) => `${l.timestamp.toISOString()},${l.userId},${l.action}`)
      .join('\n');
    const fileName = `audit_archive_${new Date().toISOString().split('T')[0]}.csv`;

    await this.storage.uploadFile(
      Buffer.from(csvContent),
      `archives/audit/${fileName}`,
      'text/csv',
    );

    await this.prisma.auditLog.deleteMany({
      where: { id: { in: oldLogs.map((l) => l.id) } },
    });

    this.logger.log(
      `Archival complete. Moved ${oldLogs.length} logs to cold storage.`,
    );
  }
}
