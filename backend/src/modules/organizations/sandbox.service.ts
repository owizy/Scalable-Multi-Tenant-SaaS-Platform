import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a 'Shadow Sandbox' organization for developers.
   * It clones all configurations from the parent but starts with zero operational data.
   */
  async createSandbox(parentOrgId: string) {
    const parent = await this.prisma.organization.findUnique({
      where: { id: parentOrgId },
      include: { featureFlags: true },
    });

    if (!parent) throw new Error('Parent organization not found.');

    const sandboxName = `${parent.name} (API Sandbox)`;
    const sandboxSlug = `${parent.slug}-sandbox-${Math.floor(Math.random() * 1000)}`;

    const sandbox = await this.prisma.organization.create({
      data: {
        name: sandboxName,
        slug: sandboxSlug,
        parentId: parentOrgId,
        isSandbox: true,
        brandColorPrimary: parent.brandColorPrimary,
        brandColorSecondary: parent.brandColorSecondary,
        logoUrl: parent.logoUrl,
        settings: parent.settings || {},
      },
    });

    // Clone Feature Flags for consistency
    for (const flag of parent.featureFlags) {
      await this.prisma.featureFlag.create({
        data: {
          key: flag.key,
          isEnabled: flag.isEnabled,
          organizationId: sandbox.id,
        },
      });
    }

    this.logger.log(
      `API Sandbox Created: ${sandbox.slug} for Dev Ecosystem Support.`,
    );
    return sandbox;
  }
}
