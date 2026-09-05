import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { organizationId?: string } }>();
    const user = request.user;
    if (!user?.organizationId) return true;

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });

    if (!org?.maintenanceWindowDay) return true;

    // 1. Determine if we are CURRENTLY in the tenant's maintenance window
    const now = new Date();
    const currentDay = now
      .toLocaleString('en-US', { weekday: 'long' })
      .toUpperCase();
    const currentHour = now.getHours();

    const isInsideWindow =
      org.maintenanceWindowDay === currentDay &&
      currentHour >= (org.maintenanceWindowHour || 0) &&
      currentHour < (org.maintenanceWindowHour || 0) + 4; // 4-hour window

    // 2. Check if a System Update is actually deployed/flagged
    const isUpdating =
      org.settings &&
      (org.settings as { isSystemUpdating?: boolean }).isSystemUpdating;

    if (isInsideWindow && isUpdating) {
      throw new ServiceUnavailableException(
        `Organization '${org.name}' is currently undergoing scheduled maintenance. Please try again in a few hours.`,
      );
    }

    return true;
  }
}
