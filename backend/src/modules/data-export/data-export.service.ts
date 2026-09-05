import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { STORAGE_PROVIDER } from '../../infrastructure/storage/storage.provider';
import type { StorageProvider } from '../../infrastructure/storage/storage.provider';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

@Injectable()
export class DataExportService {
  private readonly logger = new Logger(DataExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async exportOrganizationData(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        projects: true,
        users: true,
        invites: true,
        auditLogs: true,
      },
    });

    if (!org) throw new Error('Organization not found');

    const fileName = `export_${org.name}_${new Date().toISOString().split('T')[0]}.zip`;
    const archive = archiver('zip', { zlib: { level: 9 } });
    const passthrough = new PassThrough();

    const chunks: Buffer[] = [];
    passthrough.on('data', (c: Buffer) => chunks.push(c));

    archive.pipe(passthrough);

    // Add JSON files to ZIP
    archive.append(JSON.stringify(org.projects, null, 2), {
      name: 'projects.json',
    });
    archive.append(JSON.stringify(org.users, null, 2), { name: 'users.json' });
    archive.append(JSON.stringify(org.auditLogs, null, 2), {
      name: 'audit_logs.json',
    });
    archive.append(JSON.stringify(org, null, 2), { name: 'full_context.json' });

    await archive.finalize();

    const uploadPromise = this.storage.uploadFile(
      Buffer.concat(chunks),
      `exports/${org.id}/${fileName}`,
      'application/zip',
    );
    await uploadPromise;

    return {
      message: 'Export complete. Sending to cold storage.',
      fileName,
    };
  }
}
