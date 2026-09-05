import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { ClsService } from 'nestjs-cls';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  orgId: string;
  tier?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId, orgId } = payload;
    const user = await this.usersService.findOneById(userId);

    if (!user?.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Set context for multi-tenancy isolation
    this.cls.set('orgId', orgId);
    this.cls.set('userId', userId);

    return user;
  }
}
