import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all custom roles in the organization' })
  async getRoles(@Req() req: Request & { user: { orgId: string } }) {
    return this.rolesService.getRoles(req.user.orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role' })
  async createRole(
    @Req() req: Request & { user: { orgId: string } },
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.rolesService.createRole(req.user.orgId, name, description);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Add a permission to a custom role' })
  async addPermission(
    @Param('id') roleId: string,
    @Body('action') action: string,
    @Body('resource') resource: string,
  ) {
    return this.rolesService.addPermissionToRole(roleId, action, resource);
  }

  @Post('assign/:userId/:roleId')
  @ApiOperation({ summary: 'Assign a role to a specific user' })
  async assign(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.assignRoleToUser(userId, roleId);
  }
}
