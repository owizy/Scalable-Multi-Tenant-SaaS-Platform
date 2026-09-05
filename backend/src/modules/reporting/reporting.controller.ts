import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reporting & Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(
    private readonly reportService: ReportingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('projects/export')
  @ApiOperation({ summary: 'Export project list to Excel or PDF' })
  @ApiQuery({ name: 'format', enum: ['excel', 'pdf'] })
  async exportProjects(
    @Req() req: { user: { orgId: string } },
    @Res() res: Response,
    @Query('format') format: string = 'excel',
  ) {
    const projects = await this.prisma.project.findMany({
      where: { organizationId: req.user.orgId },
      select: { name: true, createdAt: true },
    });

    if (format === 'pdf') {
      return this.reportService.generatePdf(
        projects,
        'Project List Report',
        res,
      );
    }

    return this.reportService.generateExcel(projects, 'Project_List', res);
  }
}
