import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiAssistantService } from '../ai/ai.service';

@Injectable()
export class PredictiveAnalyticsService {
  private readonly logger = new Logger(PredictiveAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiAssistantService,
  ) {}

  async predictProjectRisk(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true },
    });

    if (!project) return;

    // Fetch last 30 days of activity for this specific project
    const recentLogs = await this.prisma.auditLog.findMany({
      where: { resourceId: projectId },
      take: 50,
      orderBy: { timestamp: 'desc' },
    });

    const summary = `
      Project Name: ${project.name}
      Status: ${project.status}
      Original Deadline: ${project.createdAt.toISOString()} (Mocked)
      Recent Activity Logs: ${JSON.stringify(recentLogs.map((l) => l.action))}
      
      Based on this velocity, predict the risk of failure or delay (0-100%). Return only the number.
    `;

    const aiResponse = await this.ai.askAboutData(
      project.organizationId,
      summary,
    );
    const riskScore =
      Number.parseInt(aiResponse.text.replaceAll(/\D/g, ''), 10) || 0;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { riskScore },
    });

    return riskScore;
  }
}
