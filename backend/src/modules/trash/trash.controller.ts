import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TrashService } from './trash.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Trash & Recovery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get(':model')
  @ApiOperation({ summary: 'List soft-deleted items for a specific model' })
  @ApiQuery({ name: 'model', enum: ['Project', 'User', 'ApiKey'] })
  async getDeletedItems(
    @Req() req: Request & { user: { orgId: string } },
    @Param('model') model: string,
  ) {
    return this.trashService.getDeletedItems(req.user.orgId, model);
  }

  @Post(':model/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted item' })
  async restore(
    @Req() req: Request & { user: { orgId: string } },
    @Param('model') model: string,
    @Param('id') id: string,
  ) {
    return this.trashService.restore(req.user.orgId, model, id);
  }
}
