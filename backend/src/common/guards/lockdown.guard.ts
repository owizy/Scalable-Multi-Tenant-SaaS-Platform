import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class LockdownGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id?: string; organizationId?: string } }>();
    const user = request.user;
    if (!user?.organizationId) return true;

    // Check if the organization is in 'Emergency Lockdown'
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true },
    });

    if (userData?.organization?.isLocked) {
      throw new ForbiddenException(
        this.i18n.t('common.ERROR.FORBIDDEN', {
          args: { name: userData.organization.name },
        }),
      );
    }

    return true;
  }
}
