import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { 'x-api-key'?: string };
      user?: { id: string };
    }>();
    const apiKeyRaw = request.headers['x-api-key'];

    if (!apiKeyRaw) {
      throw new UnauthorizedException('Missing X-API-KEY header');
    }

    const apiKey = await this.apiKeysService.validateKey(apiKeyRaw);

    if (!apiKey?.isActive) {
      throw new UnauthorizedException('Invalid or inactive API Key');
    }

    // Attach to request for controllers Use
    request.user = {
      id: apiKey.userId || '',
    };

    // Set context for ClsService (Multi-tenancy)
    this.cls.set('orgId', apiKey.organizationId);
    this.cls.set('userId', apiKey.userId);

    return true;
  }
}
