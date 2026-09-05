import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditDashboardService } from './audit-dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Audit Dashabord')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-dashboard')
export class AuditDashboardController {
  constructor(private readonly auditService: AuditDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'List organization audit logs (For Tenant Admins)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLogs(
    @Req() req: Request & { user: { orgId: string } },
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.auditService.getLogs(
      req.user.orgId,
      Number.parseInt(page, 10),
      Number.parseInt(limit, 10),
    );
  }
}
