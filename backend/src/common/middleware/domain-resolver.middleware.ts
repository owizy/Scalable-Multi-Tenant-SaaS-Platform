import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class DomainResolverMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(
    req: Request & { resolvedOrgId?: string },
    res: Response,
    next: NextFunction,
  ) {
    const host = req.headers.host;
    if (!host) return next();

    // Check if host matches a verified custom domain
    const org = await this.prisma.organization.findFirst({
      where: {
        customDomain: host,
        customDomainStatus: 'VERIFIED',
      },
      select: { id: true },
    });

    if (org) {
      // Inject orgId into the request for tenant isolation
      req.resolvedOrgId = org.id;
    }

    next();
  }
}
