import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export const CHECK_FEATURE = 'check_feature';
export const CheckFeature = (feature: string) =>
  SetMetadata(CHECK_FEATURE, feature);

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(
      CHECK_FEATURE,
      context.getHandler(),
    );
    if (!feature) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { organizationId?: string; tier?: string } }>();
    const user = request.user;
    if (!user) return true;

    const orgId = user.organizationId;
    const tier = user.tier || 'FREE';

    // 1. Fetch Trial Status for this feature for this organization
    const trial = await this.prisma.featureFlag.findUnique({
      where: {
        key_organizationId: { key: feature, organizationId: orgId as string },
      },
    });

    const isTrialActive =
      trial?.isTrial &&
      trial.trialExpiresAt &&
      trial.trialExpiresAt > new Date();

    // Feature availability mapping by tier
    const tierFeatures: Record<string, string[]> = {
      FREE: ['projects'],
      PRO: ['projects', 'webhooks', 'reporting'],
      ENTERPRISE: [
        'projects',
        'webhooks',
        'reporting',
        'ai-assistant',
        'custom-roles',
        'sso',
      ],
    };

    const allowedFeatures = tierFeatures[tier] || [];

    // 2. Allow if Tier supports it OR Trial is Active
    if (!allowedFeatures.includes(feature) && !isTrialActive) {
      throw new ForbiddenException(
        `Feature '${feature}' is currently locked. Upgrade or activate a 7-day PRO trial to continue.`,
      );
    }

    return true;
  }
}
