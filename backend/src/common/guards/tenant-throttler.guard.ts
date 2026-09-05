import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: {
    user?: { orgId?: string };
    ip?: string;
  }): Promise<string> {
    const user = req.user;
    return Promise.resolve(user?.orgId || (req.ip as string));
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context, limit, ttl } = requestProps;

    const req = context
      .switchToHttp()
      .getRequest<{ user?: { orgId?: string; tier?: string } }>();
    const orgId = req.user?.orgId;

    let finalLimit = limit;

    if (orgId) {
      const tier = req.user?.tier || 'FREE';

      const multipliers: Record<string, number> = {
        FREE: 1,
        PRO: 10,
        ENTERPRISE: 100,
      };

      const multiplier = multipliers[tier] || 1;
      finalLimit = limit * multiplier;
    }

    return super.handleRequest({
      ...requestProps,
      limit: finalLimit,
      ttl,
    });
  }
}
