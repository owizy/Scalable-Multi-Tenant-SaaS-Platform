import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { organizationId?: string } }>();
    const user = request.user;
    if (!user?.organizationId) return true;

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: { projects: true },
    });

    if (!org) return true;

    // Define Hard Limits per Tier
    const limits: Record<
      string,
      { maxStorageApi: number; maxProjects: number }
    > = {
      FREE: { maxStorageApi: 1000, maxProjects: 3 },
      PRO: { maxStorageApi: 10000, maxProjects: 20 },
      ENTERPRISE: { maxStorageApi: 1000000, maxProjects: 9999 },
    };

    const currentLimits = limits[org.subscriptionTier as string] || limits.FREE;

    // 1. Check API Call Quota (Monthly)
    if (org.apiCallsThisMonth >= currentLimits.maxStorageApi) {
      throw new HttpException(
        'Monthly API Quota Exceeded. Please upgrade your plan.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    // 2. Increment API count (Optimistically)
    await this.prisma.organization.update({
      where: { id: org.id },
      data: { apiCallsThisMonth: { increment: 1 } },
    });

    return true;
  }
}
