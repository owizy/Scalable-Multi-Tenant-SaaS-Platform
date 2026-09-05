import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiTags('Activity Stream')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityStreamController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get Organization Activity heartbeat' })
  async getStream(
    @Req() req: RequestWithUser,
    @Query('limit') limit: number = 15,
  ) {
    const logs = await this.prisma.auditLog.findMany({
      where: { organizationId: req.user.organizationId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      message: `${log.user?.firstName || 'System'} ${this.formatAction(log.action)} ${log.resource}`,
      details: log.details,
    }));
  }

  private formatAction(action: string): string {
    switch (action) {
      case 'POST':
        return 'created';
      case 'PATCH':
      case 'PUT':
        return 'updated';
      case 'DELETE':
        return 'deleted';
      default:
        return action;
    }
  }
}
