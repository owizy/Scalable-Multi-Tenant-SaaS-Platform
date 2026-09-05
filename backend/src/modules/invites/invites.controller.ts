import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AbilityGuard } from '../ability/ability.guard';
import { CheckPolicies } from '../ability/check-policies.decorator';
import { Action, AppAbility } from '../ability/ability.factory';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { InvitesService } from './invites.service';

class CreateInviteDto {
  email!: string;
  role!: UserRole;
}

@ApiTags('Invites')
@ApiBearerAuth()
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AbilityGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'User'))
  @ApiOperation({ summary: 'Send an invitation to join the organization' })
  @ApiResponse({ status: 201, description: 'Invite successfully sent' })
  async createInvite(
    @Body() data: CreateInviteDto,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string; inviteId: string }> {
    return this.invitesService.createInvite(data.email, data.role, req.user);
  }

  @Get('validate/:token')
  @ApiOperation({ summary: 'Validate an invite token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 404, description: 'Token not found or expired' })
  async validateToken(@Param('token') token: string): Promise<any> {
    return this.invitesService.validateInvite(token);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AbilityGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'User'))
  @ApiOperation({ summary: 'List all organization invites' })
  async listInvites(@Req() req: RequestWithUser): Promise<any[]> {
    return this.invitesService.getMyInvites(req.user.organizationId);
  }
}
