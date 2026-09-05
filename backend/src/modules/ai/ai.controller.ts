import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('query')
  @ApiOperation({
    summary: 'Ask the AI Assistant about your organization data',
  })
  async ask(
    @Req() req: Request & { user: { orgId: string } },
    @Body('query') query: string,
  ) {
    return this.aiService.askAboutData(req.user.orgId, query);
  }
}
