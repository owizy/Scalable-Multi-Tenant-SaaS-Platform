import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLimit(orgId: string, resource: 'projects' | 'users') {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            projects: { where: { deletedAt: null } },
            users: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!org) throw new ForbiddenException('Organization not found');

    // Get limits based on subscriptionTier
    // In a real app, you'd fetch the SubscriptionPlan from DB,
    // but here we'll use a mapping for simplicity based on the enum.
    const limits = {
      FREE: { projects: 3, users: 5 },
      PRO: { projects: 20, users: 50 },
      ENTERPRISE: { projects: 9999, users: 9999 },
    };

    const tier = org.subscriptionTier || 'FREE';
    const limit = limits[tier][resource];
    const currentCount = org._count[resource];

    if (currentCount >= limit) {
      throw new ForbiddenException(
        `Your current plan (${tier}) limit for ${resource} is reached (${limit}). Please upgrade.`,
      );
    }

    return true;
  }
}
