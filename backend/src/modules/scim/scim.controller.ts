import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('SCIM 2.0 (Enterprise User Sync)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scim/v2/Users')
export class ScimUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List Users (SCIM Query)' })
  async getUsers(
    @Query('filter') filter: string,
    @Req() req: { user: { orgId: string } },
  ) {
    // SCIM 2.0 standard response format
    const users = await this.usersService.findAll(req.user.orgId);
    return {
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: users.length,
      Resources: users.map((u) => ({
        id: u.id,
        userName: u.email,
        emails: [{ value: u.email, primary: true }],
        name: { givenName: u.firstName, familyName: u.lastName },
        active: u.isActive,
      })),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create User (SCIM Provisioning)' })
  async createUser(
    @Body()
    body: {
      userName: string;
      name?: { givenName?: string; familyName?: string };
    },
    @Req() req: { user: { orgId: string } },
  ) {
    const newUser = await this.usersService.create({
      organizationId: req.user.orgId,
      email: body.userName,
      firstName: body.name?.givenName,
      lastName: body.name?.familyName,
      role: 'MEMBER',
      password: Math.random().toString(36).slice(-10),
    });
    return newUser;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update User (SCIM Lifecycle)' })
  async patchUser(
    @Param('id') id: string,
    @Body()
    body: {
      Operations: Array<{
        op: string;
        path?: string;
        value?: { active?: boolean };
      }>;
    },
  ) {
    // Handle SCIM patch operations (deactivate, etc)
    return this.usersService.update(id, {
      isActive: body.Operations?.[0]?.value?.active,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deprovision User (SCIM Delete)' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
