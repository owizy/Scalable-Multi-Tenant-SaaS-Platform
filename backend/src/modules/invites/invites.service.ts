import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { User, UserRole, Invite, Organization } from '@prisma/client';
import { randomUUID as uuidv4 } from 'node:crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly i18n: I18nService,
  ) {}

  async createInvite(email: string, role: UserRole, currentUser: User) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(this.i18n.t('invites.ERROR.ALREADY_MEMBER'));
    }

    // Check if pending invite already exists for this org
    const existingInvite = await this.prisma.invite.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId: currentUser.organizationId,
        },
      },
    });

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      throw new ConflictException(this.i18n.t('invites.ERROR.PENDING_EXISTS'));
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = await this.prisma.invite.create({
      data: {
        email,
        token,
        role,
        organizationId: currentUser.organizationId,
        invitedById: currentUser.id,
        expiresAt,
      },
    });

    console.log(`Invite link: http://localhost:3000/register?token=${token}`);

    return {
      message: this.i18n.t('invites.SUCCESS.SENT'),
      inviteId: invite.id,
    };
  }

  async validateInvite(
    token: string,
  ): Promise<Invite & { organization: Organization }> {
    const invite = await this.prisma.invite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) {
      throw new NotFoundException(this.i18n.t('invites.ERROR.INVALID_TOKEN'));
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException(this.i18n.t('invites.ERROR.EXPIRED'));
    }

    if (invite.acceptedAt) {
      throw new ConflictException(
        this.i18n.t('invites.ERROR.ALREADY_ACCEPTED'),
      );
    }

    return invite;
  }

  async getMyInvites(organizationId: string): Promise<Invite[]> {
    return await this.prisma.invite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
