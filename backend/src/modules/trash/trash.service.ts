import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class TrashService {
  constructor(private readonly prisma: PrismaService) {}

  async getDeletedItems(orgId: string, model: string) {
    const where = { organizationId: orgId, NOT: { deletedAt: null } };
    const orderBy = { deletedAt: 'desc' } as const;

    switch (model) {
      case 'Project':
        return this.prisma.project.findMany({ where, orderBy });
      case 'User':
        return this.prisma.user.findMany({ where, orderBy });
      default:
        throw new NotFoundException(
          `Model ${model} not found or not supported for trash`,
        );
    }
  }

  async restore(orgId: string, model: string, id: string) {
    let item: { organizationId: string; deletedAt: Date | null } | null;

    switch (model) {
      case 'Project':
        item = await this.prisma.project.findUnique({ where: { id } });
        break;
      case 'User':
        item = await this.prisma.user.findUnique({ where: { id } });
        break;
      default:
        throw new NotFoundException(`Model ${model} not supported`);
    }

    if (item?.organizationId !== orgId) {
      throw new ForbiddenException('Item not found or access denied');
    }

    if (!item.deletedAt) {
      throw new Error('Item is not deleted');
    }

    const updateData = { where: { id }, data: { deletedAt: null } };

    switch (model) {
      case 'Project':
        return this.prisma.project.update(updateData);
      case 'User':
        return this.prisma.user.update(updateData);
      default:
        throw new NotFoundException(`Model ${String(model)} not supported`);
    }
  }
}
