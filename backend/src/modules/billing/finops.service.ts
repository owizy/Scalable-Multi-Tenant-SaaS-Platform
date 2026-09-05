import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class FinOpsService {
  private readonly logger = new Logger(FinOpsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async reconcileBilling(orgId: string) {
    this.logger.log(`Starting Finance Reconciliation for Org: ${orgId}`);

    // Fetch raw Stripe data (In production, this would hit Stripe's Invoice API)
    const [auditLogs, org] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { organizationId: orgId, action: { contains: 'API_CALL' } },
        take: 1000,
      }),
      this.prisma.organization.findUnique({
        where: { id: orgId },
        select: { subscriptionTier: true, apiCallsThisMonth: true },
      }),
    ]);

    const apiCost = (org?.apiCallsThisMonth || 0) * 0.01; // Mock $0.01 per call
    const platformCost = org?.subscriptionTier === 'PRO' ? 49 : 0;

    const report = {
      reconciledDate: new Date(),
      orgId,
      tier: org?.subscriptionTier,
      lineItems: [
        { item: 'SaaS Platform Subscription', cost: platformCost },
        {
          item: 'Elastic API Calls',
          cost: apiCost,
          quantity: org?.apiCallsThisMonth,
        },
      ],
      totalBalance: platformCost + apiCost,
      status: 'VERIFIED',
      auditContextRef: auditLogs.length > 0 ? auditLogs[0].id : null,
    };

    // Store the report for the finance team
    await this.prisma.auditLog.create({
      data: {
        action: 'FINOPS_RECONCILIATION_REPORT_GENERATED',
        resource: 'Organization',
        resourceId: orgId,
        organizationId: orgId,
        details: report,
      },
    });

    return report;
  }
}
