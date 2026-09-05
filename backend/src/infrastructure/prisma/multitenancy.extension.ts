/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

/**
 * World-Class Global Multi-Region & Zero-Downtime Scaling.
 * Dynamically resolves connection strings based on:
 * 1. Physical Isolation (dedicated DB)
 * 2. Geo-Routing (RegionGroup mapping)
 * 3. Shadow Writes (Migration tracking)
 */
export const multitenancyExtension = (cls: ClsService) => {
  type PrismaModelOperation = Record<
    string,
    Record<string, (args: object) => Promise<object | object[] | null>>
  >;

  return (client: PrismaClient) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const orgDbUrl = cls.get('org_database_url') || undefined;
            const migrationStatus =
              cls.get('org_migration_status') || undefined;
            const newDbUrl = cls.get('org_new_database_url') || undefined;
            const regionGroup = cls.get('org_region_group') || undefined;

            // 1. DUAL-WRITE Pattern (Shadow Writes for Re-Sharding)
            const isWrite = ['create', 'update', 'delete', 'upsert'].includes(
              operation,
            );
            if (isWrite && migrationStatus === 'SYNCING' && newDbUrl) {
              const shadowClient = new PrismaClient({
                datasourceUrl: newDbUrl,
              } as Prisma.PrismaClientOptions);
              await (shadowClient as object as PrismaModelOperation)[model][
                operation
              ](args).catch(() => {});
            }

            // 2. Physical Isolation Bridge (Dedicated DB URL)
            if (orgDbUrl) {
              const dedicatedClient = new PrismaClient({
                datasourceUrl: orgDbUrl,
              } as Prisma.PrismaClientOptions);
              return (dedicatedClient as object as PrismaModelOperation)[model][
                operation
              ](args);
            }

            // 3. GEO-ROUTING Bridge (Physical Sharding based on Region)
            if (regionGroup === 'EU') {
              const euClient = new PrismaClient({
                datasourceUrl: process.env.EU_DATABASE_URL || '',
              } as Prisma.PrismaClientOptions);
              return (euClient as object as PrismaModelOperation)[model][
                operation
              ](args);
            } else if (regionGroup === 'ASIA') {
              const asiaClient = new PrismaClient({
                datasourceUrl: process.env.ASIA_DATABASE_URL || '',
              } as Prisma.PrismaClientOptions);
              return (asiaClient as object as PrismaModelOperation)[model][
                operation
              ](args);
            }

            // Fallback to the default region-shared/pooled database.
            return query(args);
          },
        },
      },
    });
  };
};
