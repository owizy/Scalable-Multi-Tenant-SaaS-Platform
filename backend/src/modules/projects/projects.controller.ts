import {
  Controller,
  Get,
  Post,
  Put,
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
import { Prisma, Project } from '@prisma/client';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AbilityGuard } from '../ability/ability.guard';
import { Action, AppAbility } from '../ability/ability.factory';
import {
  CreateProjectPolicyHandler,
  UpdateProjectPolicyHandler,
} from '../ability/policies/project.policy';
import { CheckPolicies } from '../ability/check-policies.decorator';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, AbilityGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all projects in the current organization' })
  @ApiResponse({ status: 200, description: 'Return array of projects' })
  async findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Return the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, 'Project'))
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.findOne(id, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project successfully created' })
  @CheckPolicies(new CreateProjectPolicyHandler())
  async create(
    @Body() data: Prisma.ProjectUncheckedCreateInput,
    @Req() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.create(data, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project successfully updated' })
  @CheckPolicies(new UpdateProjectPolicyHandler())
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.ProjectUpdateInput,
    @Req() req: RequestWithUser,
  ): Promise<Project> {
    return this.projectsService.update(id, data, req.user);
  }
}
