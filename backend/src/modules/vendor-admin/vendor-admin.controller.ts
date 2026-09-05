import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorAdminService } from './vendor-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Vendor Support & Platform Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('vendor-admin')
export class VendorAdminController {
  constructor(private readonly vendorService: VendorAdminService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get global platform statistics (Super Admin only)',
  })
  async getStats() {
    return this.vendorService.getPlatformStats();
  }

  @Get('health/organizations')
  @ApiOperation({
    summary: 'Get health and usage metrics for all organizations',
  })
  async getOrgHealth() {
    return this.vendorService.getOrganizationHealth();
  }
}
