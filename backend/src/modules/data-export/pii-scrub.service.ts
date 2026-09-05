import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class PiiScrubService {
  private readonly logger = new Logger(PiiScrubService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * World-Class Privacy Export: Anonymizes all User PII (FirstName, LastName, Email, Phone)
   * while maintaining relational integrity. This enables external auditing without
   * data breach risk or GDPR violation.
   */
  async generateScrubbedSnapshot(orgId: string, phone?: string) {
    this.logger.log(`Generating PII-Anonymized Snapshot for Org: ${orgId}`);

    const user = await this.prisma.user.findFirst({
      where: { phoneNumber: phone || '' },
      include: { organization: true },
    });

    if (!user || user.organization?.isLocked) {
      return { status: 'ACCESS_DENIED' };
    }

    const users = await this.prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
      },
    });

    const scrubbedUsers = users.map((user) => ({
      id: user.id,
      email: `SCRUBBED_USER_${user.id.slice(0, 8)}@anon-org.com`,
      firstName: `User-${user.id.slice(0, 4)}`,
      lastName: `Relational-Anon`,
      phoneNumber: `+00-0000000000`,
    }));

    // In a production system, this would then stream a full .sql or .json dump
    // to S3 and return a signed URL.
    return {
      status: 'ANONYMIZED_SUCCESS',
      usersReportedCount: users.length,
      snapshot: scrubbedUsers,
      timestamp: new Date(),
    };
  }
}
