import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    organizationId: string;
    details?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        userId: data.userId,
        organizationId: data.organizationId,
        details: data.details,
      },
    });
  }
}
