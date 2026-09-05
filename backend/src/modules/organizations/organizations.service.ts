import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Organization, Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<Organization> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  async updateSettings(id: string, settings: Record<string, unknown>) {
    const org = await this.findOne(id);
    const currentSettings = (org.settings as Record<string, unknown>) || {};

    return this.prisma.organization.update({
      where: { id },
      data: {
        settings: {
          ...currentSettings,
          ...settings,
        } as Prisma.InputJsonValue,
      },
    });
  }
}
