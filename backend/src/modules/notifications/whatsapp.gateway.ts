import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiAssistantService } from '../ai/ai.service';

/**
 * Universal SaaS Access Gateway: WhatsApp/Telegram/Slack Identity Bridge.
 * This enables users to interact with their SaaS Copilot via mobile chat apps.
 */
@Injectable()
export class WhatsAppGateway {
  private readonly logger = new Logger(WhatsAppGateway.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiAssistantService,
  ) {}

  /**
   * Main entry point for a WhatsApp/Chat message.
   * Performs an identity check based on the sender's phone number.
   */
  async handleIncomingMessage(phone: string, message: string) {
    this.logger.log(`Incoming Universal AI Bridge Message from: ${phone}`);

    // 1. Identity Check: Verify if a user exists with this phone number
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber: phone },
      include: { organization: true },
    });

    if (!user || user.organization?.isLocked) {
      this.logger.warn(`Unauthorized or Locked Access attempt from: ${phone}`);
      throw new UnauthorizedException(
        'Identity not verified or Organization is in Lockdown.',
      );
    }

    // 2. Permission Check: Verify if the user is active
    if (!user.isActive)
      throw new UnauthorizedException('User account is suspended.');

    // 3. AI Copilot Proxy: Route the message to the organization-specific AI
    const aiResponse = await this.ai.askAboutData(user.organizationId, message);

    // 4. Return the response (in production, this would hit Twilio/WhatsApp API)
    return {
      recipient: phone,
      response: aiResponse.text,
      senderIdentity: `${user.firstName} ${user.lastName}`,
    };
  }
}
