import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@ApiTags('SSL / ACME')
@Controller('.well-known/acme-challenge')
export class AcmeChallengeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Solve ACME Challenge for Custom Domains' })
  async solve(@Param('token') token: string) {
    // Check if any organization has this challenge token in their settings
    const orgs = await this.prisma.organization.findMany({
      where: {
        settings: {
          path: ['acmeChallenges', token],
          not: Prisma.AnyNull,
        },
      },
    });

    if (orgs.length === 0) {
      throw new NotFoundException('Challenge not found.');
    }

    // Return the corresponding key-auth string
    const challengeData = orgs[0].settings as {
      acmeChallenges?: Record<string, string>;
    };
    return challengeData.acmeChallenges?.[token];
  }
}
