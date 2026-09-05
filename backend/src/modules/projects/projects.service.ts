import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { I18nService } from 'nestjs-i18n';
import { Prisma, Project, User } from '@prisma/client';
import { AbilityFactory, Action } from '../ability/ability.factory';
import { subject } from '@casl/ability';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly abilityFactory: AbilityFactory,
    private readonly i18n: I18nService,
  ) {}

  async findAll(): Promise<Project[]> {
    // Automated multi-tenancy: organizationId injected via Prisma Extension
    return this.prisma.project.findMany({
      include: { owner: true },
    });
  }

  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!project) {
      throw new NotFoundException(this.i18n.t('projects.ERROR.NOT_FOUND'));
    }

    // ABAC check: Can user read this specific project?
    const ability = this.abilityFactory.createForUser(user);
    if (ability.cannot(Action.Read, subject('Project', project))) {
      throw new ForbiddenException(
        this.i18n.t('projects.ERROR.FORBIDDEN_READ'),
      );
    }

    return project;
  }

  async create(
    data: Prisma.ProjectUncheckedCreateInput,
    user: User,
  ): Promise<Project> {
    // Logic for project creation: only admin/manager should create (handled in guard,
    // but here we ensure it is tied to the current organization)
    return this.prisma.project.create({
      data: {
        ...data,
        ownerId: user.id,
        organizationId: user.organizationId,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.ProjectUpdateInput,
    user: User,
  ): Promise<Project> {
    const project = await this.findOne(id, user);

    const ability = this.abilityFactory.createForUser(user);
    if (ability.cannot(Action.Update, subject('Project', project))) {
      throw new ForbiddenException(
        this.i18n.t('projects.ERROR.FORBIDDEN_UPDATE'),
      );
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }
}
