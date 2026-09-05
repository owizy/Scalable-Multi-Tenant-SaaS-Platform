import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AiAssistantService {
  private readonly genAI?: GoogleGenerativeAI;
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async askAboutData(orgId: string, userQuery: string) {
    if (!this.genAI) {
      throw new Error(
        'AI Assistant is not configured (Missing GEMINI_API_KEY)',
      );
    }

    const [projectCount, userCount, auditLogs] = await Promise.all([
      this.prisma.project.count({ where: { organizationId: orgId } }),
      this.prisma.user.count({ where: { organizationId: orgId } }),
      this.prisma.auditLog.findMany({
        where: { organizationId: orgId },
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: { action: true, timestamp: true },
      }),
    ]);

    const context = `
      You are an AI Assistant for a Multi-Tenant SaaS.
      The user's organization has:
      - Total Projects: ${projectCount}
      - Total Users: ${userCount}
      - Recent Audit Logs: ${JSON.stringify(auditLogs)}
      
      Answer the user's question accurately based on this data.
    `;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([context, userQuery]);
    return {
      text: result.response.text(),
      timestamp: new Date(),
    };
  }

  async generateProjectInsights(prompt: string) {
    const model = this.genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    return {
      text: result.response.text(),
      timestamp: new Date(),
    };
  }

  // Autonomous Copilot Execution (The Alpha Feature)
  async executeCopilotAction(orgId: string, prompt: string) {
    const model = this.genAI!.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [
        {
          functionDeclarations: [
            {
              name: 'createProject',
              description: 'Creates a new project in the organization',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                },
                required: ['name'],
              },
            },
          ],
        },
      ],
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const call = result.response.functionCalls()?.[0];

    if (call?.name === 'createProject') {
      const { name, description } = call.args as Record<string, string>;
      return this.prisma.project.create({
        data: {
          name,
          description,
          organizationId: orgId,
          ownerId: 'SYSTEM_AI',
        },
      });
    }

    return { text: result.response.text() };
  }
}
