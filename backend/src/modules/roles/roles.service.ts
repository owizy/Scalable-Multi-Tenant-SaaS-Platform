import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(orgId: string, name: string, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description,
        organizationId: orgId,
      },
    });
  }

  async addPermissionToRole(roleId: string, action: string, resource: string) {
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          create: {
            action,
            resource,
          },
        },
      },
      include: { permissions: true },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRoleMapping.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async getRoles(orgId: string) {
    return this.prisma.role.findMany({
      where: { organizationId: orgId },
      include: { permissions: true },
    });
  }
}
