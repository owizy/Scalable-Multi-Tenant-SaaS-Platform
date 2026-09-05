import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AbilityGuard } from '../ability/ability.guard';
import { Action, AppAbility } from '../ability/ability.factory';
import { CheckPolicies } from '../ability/check-policies.decorator';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { UserWithoutPassword } from '../auth/auth.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, AbilityGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new user to the organization' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, 'User'))
  create(@Body() data: CreateUserDto, @Req() req: RequestWithUser) {
    // Ensure only admins/managers can create users (handled by CASL/guard generally)
    // But here we enforce the organizationId matches the current user's org
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.MANAGER
    ) {
      throw new ForbiddenException('Only admins and managers can add users');
    }

    return this.usersService.create({
      ...data,
      organizationId: req.user.organizationId,
    }) as unknown as UserWithoutPassword;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the current user' })
  async getMe(@Req() req: RequestWithUser) {
    const result = { ...req.user } as Record<string, unknown>;
    delete result.password;
    return await Promise.resolve(result as UserWithoutPassword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const result = { ...user } as Record<string, unknown>;
    delete result.password;
    return result as UserWithoutPassword;
  }
}
