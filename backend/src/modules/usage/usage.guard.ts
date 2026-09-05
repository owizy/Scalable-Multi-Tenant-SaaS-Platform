import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsageService } from './usage.service';

export const CHECK_USAGE = 'check_usage';
export const EnforceUsage = (resource: 'projects' | 'users') =>
  SetMetadata(CHECK_USAGE, resource);

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usageService: UsageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<'projects' | 'users'>(
      CHECK_USAGE,
      context.getHandler(),
    );
    if (!resource) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { orgId?: string } }>();

    const orgId = request.user?.orgId;
    if (!orgId) return true;

    const allowed = await this.usageService
      .checkLimit(orgId, resource)
      .then(() => true)
      .catch((error) => {
        throw error; // preserves NestJS behavior
      });

    return allowed;
  }
}
