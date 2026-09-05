import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new API Key for the current organization',
  })
  @ApiResponse({
    status: 201,
    description: 'API Key created (raw key shown only once)',
  })
  create(
    @Req() req: Request & { user: { organizationId: string; sub: string } },
    @Body() dto: CreateApiKeyDto,
  ) {
    const organizationId = req.user.organizationId;
    const userId = req.user.sub;
    return this.apiKeysService.create(organizationId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all API Keys for the current organization' })
  findAll(@Req() req: Request & { user: { organizationId: string } }) {
    const organizationId = req.user.organizationId;
    return this.apiKeysService.findAll(organizationId);
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke an API Key' })
  revoke(
    @Req() req: Request & { user: { organizationId: string } },
    @Param('id') id: string,
  ) {
    const organizationId = req.user.organizationId;
    return this.apiKeysService.revoke(id, organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an API Key' })
  delete(
    @Req() req: Request & { user: { organizationId: string } },
    @Param('id') id: string,
  ) {
    const organizationId = req.user.organizationId;
    return this.apiKeysService.delete(id, organizationId);
  }
}
