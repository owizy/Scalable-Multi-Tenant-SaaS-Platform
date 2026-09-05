/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { InvitesService } from '../invites/invites.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// @ts-expect-error otplib types missing
import { authenticator, generateSecret, generateURI } from 'otplib';
import * as QRCode from 'qrcode';
import { randomBytes } from 'node:crypto';
import { RegisterDto } from './dto/register.dto';

export type UserWithoutPassword = Omit<User, 'password'>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  orgId: string;
  isImpersonated?: boolean;
  impersonatedBy?: string;
}

interface RegisterInviteData {
  password?: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => InvitesService))
    private readonly invitesService: InvitesService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async validateSamlUser(profile: {
    email: string;
    name?: { givenName?: string; familyName?: string };
  }): Promise<UserWithoutPassword> {
    const user = await this.usersService.findOneByEmail(profile.email);

    if (!user) {
      return this.register({
        email: profile.email,
        password: randomBytes(24).toString('hex'),
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        organizationName: `${profile.name?.givenName || 'User'}'s Workspace`,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async registerWithInvite(
    token: string,
    data: RegisterInviteData,
  ): Promise<UserWithoutPassword> {
    const invite = await this.invitesService.validateInvite(token);

    return this.prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(data.password || '', 10);

      const user = await tx.user.create({
        data: {
          email: invite.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: invite.role,
          organizationId: invite.organizationId,
        },
      });

      // Mark invite as accepted
      const inviteModel = (
        tx as unknown as Record<
          string,
          {
            update: (args: {
              where: { id: string };
              data: { acceptedAt: Date };
            }) => Promise<object>;
          }
        >
      ).invite;
      await inviteModel.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    });
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOAuthUser(profile: {
    email: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserWithoutPassword> {
    const user = await this.usersService.findOneByEmail(profile.email);

    if (!user) {
      // Auto-register in a default organization or a "Personal" one
      return this.register({
        email: profile.email,
        password: randomBytes(24).toString('hex'),
        firstName: profile.firstName,
        lastName: profile.lastName,
        organizationName: `${profile.firstName}'s Workspace`,
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  async login(user: User & { isTwoFactorEnabled?: boolean }) {
    if (user.isTwoFactorEnabled) {
      return {
        mfa_required: true,
        user_id: user.id,
      };
    }
    return this.generateTokens(user);
  }

  async generateTwoFactorSecret(user: User) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: this.configService.get('APP_NAME', 'MultiTenantSaaS'),
      label: user.email,
      secret,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Save secret temporarily (or just return it and save when enabled)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user?.twoFactorSecret) {
      throw new Error(this.i18n.t('auth.ERROR.2FA_NOT_GENERATED'));
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new Error(this.i18n.t('auth.ERROR.INVALID_2FA'));
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { success: true };
  }

  async verifyTwoFactorLogin(userId: string, code: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user?.twoFactorSecret || !user.isTwoFactorEnabled) {
      throw new Error(this.i18n.t('auth.ERROR.2FA_NOT_ENABLED'));
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new Error(this.i18n.t('auth.ERROR.INVALID_2FA'));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return this.generateTokens(result);
  }

  async generateTokens(user: UserWithoutPassword) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      orgId: user.organizationId,
    };

    const jwtExpiration = this.configService.get<string>(
      'JWT_EXPIRATION',
      '15m',
    );
    const refreshExpiration = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: jwtExpiration as any }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiration as any,
      }),
    ]);

    // Save refresh token in DB
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    // Verify token
    try {
      await this.jwtService.verifyAsync(token);
      const dbToken = await this.prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!dbToken || dbToken.expiresAt < new Date()) {
        throw new Error(this.i18n.t('auth.ERROR.REFRESH_EXPIRED'));
      }

      // Remove old token (or rotate it)
      await this.prisma.refreshToken.delete({ where: { id: dbToken.id } });

      return this.generateTokens(dbToken.user);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Invalid refresh token: ${message}`, { cause: e });
    }
  }

  async register(data: RegisterDto): Promise<UserWithoutPassword> {
    // Create organization and user in a transaction
    return this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug: data.organizationName.toLowerCase().replaceAll(' ', '-'),
        },
      });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.ADMIN, // Use enum
          organizationId: organization.id,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = user;
      return result;
    });
  }

  async impersonate(adminUser: User, targetUserId: string) {
    if (adminUser.role !== UserRole.SUPER_ADMIN) {
      throw new Error(this.i18n.t('auth.ERROR.FORBIDDEN_IMPERSONATE'));
    }

    const targetUser = await this.usersService.findOneById(targetUserId);
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Generate tokens with impersonation payload
    const payload: JwtPayload = {
      sub: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      orgId: targetUser.organizationId,
      isImpersonated: true,
      impersonatedBy: adminUser.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '1h' }), // Shorter session
      this.jwtService.signAsync(payload, { expiresIn: '1h' }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      is_impersonated: true,
    };
  }
}
