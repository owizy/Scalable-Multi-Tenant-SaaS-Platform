import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class IpAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { orgId?: string };
      ip?: string;
      connection?: { remoteAddress?: string };
    }>();
    const orgId = request.user?.orgId;
    const clientIp = request.ip || request.connection?.remoteAddress || '';

    if (!orgId) return true;

    // Fetch the organization to check allowed IPs
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { allowedIPs: true },
    });

    if (org?.allowedIPs && org.allowedIPs.length > 0) {
      if (!org.allowedIPs.includes(clientIp)) {
        throw new ForbiddenException(
          `Access from your IP (${clientIp}) is not authorized for this organization.`,
        );
      }
    }

    return true;
  }
}
