import {
  Controller,
  Get,
  Param,
  UseGuards,
  Patch,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateOrganizationSettingsDto } from './dto/update-settings.dto';
import { I18nService } from 'nestjs-i18n';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly i18n: I18nService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Return organization info' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(
    @Req() req: { user: { id: string; role: string } },
    @Param('id') id: string,
  ) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update organization settings' })
  async updateSettings(
    @Param('id') id: string,
    @Req() req: { user: { orgId: string } },
    @Body() dto: UpdateOrganizationSettingsDto,
  ) {
    // Only allow updating the current organization
    if (req.user.orgId !== id) {
      throw new ForbiddenException('Invalid organization access');
    }

    return this.organizationsService.updateSettings(
      id,
      dto as unknown as Record<string, unknown>,
    );
  }

  @Patch(':id/lockdown')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Trigger Emergency Organization Lockdown (The Panic Button)',
  })
  async triggerLockdown(
    @Param('id') id: string,
    @Req() req: { user: { orgId: string } },
    @Body() body: { isLocked: boolean },
  ) {
    if (req.user.orgId !== id)
      throw new ForbiddenException('Illegal tenant access');

    await this.organizationsService.updateSettings(id, {
      isLocked: body.isLocked,
    });

    return {
      message: body.isLocked
        ? this.i18n.t('organizations.SUCCESS.LOCKDOWN_TRIGGERED')
        : this.i18n.t('common.SUCCESS.UPDATED'),
    };
  }

  @Patch(':id/maintenance')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Set SLA Maintenance Window' })
  async setMaintenanceWindow(
    @Param('id') id: string,
    @Req() req: { user: { orgId: string } },
    @Body() body: { startTime: Date; endTime: Date },
  ) {
    if (req.user.orgId !== id)
      throw new ForbiddenException('Illegal tenant access');

    await this.organizationsService.updateSettings(id, {
      maintenanceWindowStart: body.startTime,
      maintenanceWindowEnd: body.endTime,
    });

    return { message: this.i18n.t('common.SUCCESS.UPDATED') };
  }

  @Patch(':id/ip-guard')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Configure IP-Based Access Control list' })
  async setIpGuard(
    @Param('id') id: string,
    @Req() req: { user: { orgId: string } },
    @Body() body: { allowedIps: string[] },
  ) {
    if (req.user.orgId !== id)
      throw new ForbiddenException('Illegal tenant access');

    await this.organizationsService.updateSettings(id, {
      allowedIps: body.allowedIps,
    });

    return { message: this.i18n.t('common.SUCCESS.UPDATED') };
  }
}
