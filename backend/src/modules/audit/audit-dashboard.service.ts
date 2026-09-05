import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(orgId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId: orgId },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.auditLog.count({
        where: { organizationId: orgId },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
