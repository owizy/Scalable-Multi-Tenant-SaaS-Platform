import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PiiScrubService } from './pii-scrub.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { Request } from 'express';

@ApiTags('Data Export')
@ApiBearerAuth()
@Controller('data-export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataExportController {
  constructor(private readonly piiScrubService: PiiScrubService) {}

  @Get('pii-scrub')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Export anonymized, relational PII snapshot (GDPR Compliance)',
  })
  async getScrubbedSnapshot(
    @Req() req: Request & { user: { orgId: string } },
    @Res() res: Response,
  ) {
    const orgId = req.user.orgId;
    const snapshot = await this.piiScrubService.generateScrubbedSnapshot(orgId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pii_anonymized_${orgId}.json`,
    );
    return res.send(snapshot);
  }
}
