import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from '@node-saml/passport-saml';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // @ts-expect-error type signature issues with node-saml
    super({
      entryPoint: configService.get<string>('SAML_ENTRY_POINT'),
      issuer: configService.get<string>('SAML_ISSUER'),
      callbackUrl: configService.get<string>('SAML_CALLBACK_URL'),
      cert: configService.get<string>('SAML_CERT'),
    });
  }

  async validate(
    profile: Profile & {
      nameID?: string;
      firstName?: string;
      lastName?: string;
      organizationSlug?: string;
    },
  ): Promise<any> {
    const user = {
      email: profile.email || profile.nameID || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      organizationSlug: profile.organizationSlug || '',
    };

    return this.authService.validateSamlUser(user);
  }
}
