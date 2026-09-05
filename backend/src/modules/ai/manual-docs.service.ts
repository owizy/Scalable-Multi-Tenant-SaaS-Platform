import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AiAssistantService } from './ai.service';

@Injectable()
export class ManualDocsService {
  private readonly logger = new Logger(ManualDocsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiAssistantService,
  ) {}

  /**
   * Generates a custom Platform Manual for an entire organization.
   * Based on their tiers, feature flags, and custom roles.
   */
  async generateOrganizationManual(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        featureFlags: true,
        roles: { include: { permissions: true } },
      },
    });

    if (!org) return;

    const summary = `
      Organization: ${org.name}
      Subscription Tier: ${org.subscriptionTier}
      Custom Branding: ${org.brandColorPrimary}
      Active Feature Flags: ${JSON.stringify(org.featureFlags.filter((f) => f.isEnabled).map((f) => f.key))}
      Internal Custom Roles: ${JSON.stringify(org.roles.map((r) => r.name))}
      
      Generate a professional 1-page User Manual in Markdown. 
      Focus on how their specific users should use this configuration.
    `;

    const aiResponse = await this.ai.askAboutData(orgId, summary);
    const manualDocs = aiResponse.text;

    // Save to organization settings for the dashboard UI
    const currentSettings = (org.settings as Prisma.JsonObject) || {};
    await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        settings: {
          ...currentSettings,
          generatedManualDocs: manualDocs,
          manualGeneratedAt: new Date(),
        },
      },
    });

    this.logger.log(
      `Self-Generating Manual Refreshed for Org: ${org.name}. (AI-Powered).`,
    );
    return manualDocs;
  }
}
