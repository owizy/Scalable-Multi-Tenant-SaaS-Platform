import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

/**
 * Models that require tenant isolation via organizationId
 */
const TENANT_MODELS = new Set(['User', 'Project', 'AuditLog', 'ApiKey']);

/**
 * Models that support soft deletes via deletedAt
 */
const SOFT_DELETE_MODELS = new Set([
  'Organization',
  'User',
  'Project',
  'ApiKey',
]);

export const prismaTenancyExtension = (cls: ClsService) => {
  return Prisma.defineExtension({
    name: 'tenancyIsolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const orgId = cls.get<string>('orgId');
          const skipIsolation = cls.get<boolean>('skipTenantIsolation');
          const showDeleted = cls.get<boolean>('showDeleted');

          const isFilterOperation = [
            'findMany',
            'findFirst',
            'findUnique',
            'count',
            'aggregate',
            'groupBy',
            'update',
            'updateMany',
            'delete',
            'deleteMany',
            'upsert',
          ].includes(operation);

          // --- 1. Tenant Isolation ---
          if (orgId && !skipIsolation && TENANT_MODELS.has(model)) {
            if (isFilterOperation) {
              const typedArgs = args as Record<string, any>;
              typedArgs.where = (typedArgs.where as Record<string, any>) || {};
              (typedArgs.where as Record<string, any>)['organizationId'] =
                orgId;
            }
          }

          // --- 2. Soft Delete Filtering ---
          if (!showDeleted && SOFT_DELETE_MODELS.has(model)) {
            const isReadOperation = [
              'findMany',
              'findFirst',
              'findUnique',
              'count',
              'aggregate',
              'groupBy',
            ].includes(operation);

            if (isReadOperation) {
              const typedArgs = args as Record<string, any>;
              typedArgs.where = (typedArgs.where as Record<string, any>) || {};
              (typedArgs.where as Record<string, any>)['deletedAt'] = null;
            }
          }

          return query(args);
        },

        async delete({ model, args, query }) {
          if (SOFT_DELETE_MODELS.has(model)) {
            const context = Prisma.getExtensionContext(this) as {
              update: (args: {
                data: Record<string, unknown>;
                where: Record<string, unknown>;
              }) => Promise<object>;
            };
            return context.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },

        async deleteMany({ model, args, query }) {
          if (SOFT_DELETE_MODELS.has(model)) {
            const context = Prisma.getExtensionContext(this) as {
              updateMany: (args: {
                data: Record<string, unknown>;
                where: Record<string, unknown>;
              }) => Promise<object>;
            };
            return context.updateMany({
              where: args.where as Record<string, unknown>,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
      },
    },
  });
};
