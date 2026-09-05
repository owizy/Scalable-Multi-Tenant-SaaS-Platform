import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class VendorAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformStats() {
    // Only for super admins
    const [totalOrgs, activeUsers, totalProjects, revenueByTier] =
      await Promise.all([
        this.prisma.organization.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.project.count(),
        this.prisma.organization.groupBy({
          by: ['subscriptionTier'],
          _count: { _all: true },
        }),
      ]);

    return {
      overview: {
        totalOrganizations: totalOrgs,
        totalActiveUsers: activeUsers,
        totalProjects,
      },
      distribution: revenueByTier,
      timestamp: new Date(),
    };
  }

  async getOrganizationHealth() {
    return this.prisma.organization.findMany({
      take: 20,
      include: {
        _count: {
          select: { projects: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
