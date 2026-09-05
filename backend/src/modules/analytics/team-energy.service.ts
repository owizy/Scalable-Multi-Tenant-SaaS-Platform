import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiAssistantService } from '../ai/ai.service';

@Injectable()
export class TeamEnergyService {
  private readonly logger = new Logger(TeamEnergyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiAssistantService,
  ) {}

  /**
   * Analyzes an organization's work patterns (vibration/velocity/hours) to determine
   * their emotional energy and burnout risk (0-100%). High-EQ analytics.
   */
  async analyzeTeamVibe(orgId: string) {
    this.logger.log(
      `Analyzing Team Energy Analysis (Burnout Risk) for Org: ${orgId}`,
    );

    // Fetch last 30 days of audit logs (Filtered for timestamps)
    const recentActivity = await this.prisma.auditLog.findMany({
      where: { organizationId: orgId },
      take: 200,
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, action: true },
    });

    const summary = `
      Organization Activity Sample: ${JSON.stringify(recentActivity)}
      
      Determine the 'Emotional Energy' and 'Burnout Risk' of this team.
      0 = Critical Burnout Crisis, 100 = Peak Healthy Performance.
      Return the final number only.
    `;

    const aiResponse = await this.ai.askAboutData(orgId, summary);
    const energyScore =
      Number.parseInt(aiResponse.text.replaceAll(/\D/g, ''), 10) || 100;

    // Save to all organization projects (or a specific summary log)
    await this.prisma.project.updateMany({
      where: { organizationId: orgId },
      data: { teamEnergyScore: energyScore },
    });

    this.logger.log(
      `Team Energy Score Calculated: ${energyScore} for Org: ${orgId}. (AI-Powered).`,
    );
    return energyScore;
  }
}
