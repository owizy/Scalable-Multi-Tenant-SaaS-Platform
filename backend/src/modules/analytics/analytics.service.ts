import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganizationHeatmap(orgId: string, days: number = 90) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        organizationId: orgId,
        timestamp: { gte: startDate },
      },
      select: { timestamp: true },
    });

    const heatmap: Record<string, number> = {};
    logs.forEach((log) => {
      const date = log.timestamp.toISOString().split('T')[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    return Object.entries(heatmap).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
