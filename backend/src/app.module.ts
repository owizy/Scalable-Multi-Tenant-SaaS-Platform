import {
  Module,
  RequestMethod,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './infrastructure/health/health.module';
import { MetricsModule } from './infrastructure/metrics/metrics.module';
import { MetricsMiddleware } from './infrastructure/metrics/metrics.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AbilityModule } from './modules/ability/ability.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SecurityModule } from './modules/security/security.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { InvitesModule } from './modules/invites/invites.module';
import { BullModule } from '@nestjs/bullmq';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ClsModule } from 'nestjs-cls';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { UsageModule } from './modules/usage/usage.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TrashModule } from './modules/trash/trash.module';
import { AuditDashboardModule } from './modules/audit/audit-dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { RolesModule } from './modules/roles/roles.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { DataExportModule } from './modules/data-export/data-export.module';
import { EncryptionModule } from './modules/encryption/encryption.module';
import { ScimModule } from './modules/scim/scim.module';
import { VendorAdminModule } from './modules/vendor-admin/vendor-admin.module';
import { FeatureGuard } from './common/guards/feature.guard';
import { IpAccessGuard } from './common/guards/ip-access.guard';
import { TenantThrottlerGuard } from './common/guards/tenant-throttler.guard';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'node:path';
import { ActivityStreamModule } from './modules/activity-stream/activity-stream.module';

@Module({
  imports: [
    // Request Context
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60),
          limit: config.get<number>('THROTTLE_LIMIT', 10),
        },
      ],
    }),

    // Background Jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    // Infrastructure
    PrismaModule,
    HealthModule,
    MetricsModule,
    AbilityModule,
    OrganizationsModule,

    // Features
    AuthModule,
    UsersModule,
    ProjectsModule,
    InvitesModule,
    NotificationsModule,
    BillingModule,
    ApiKeysModule,
    StorageModule,
    UsageModule,
    WebhooksModule,
    TrashModule,
    AuditDashboardModule,
    AiModule,
    RolesModule,
    ReportingModule,
    MaintenanceModule,
    DataExportModule,
    EncryptionModule,
    ScimModule,
    VendorAdminModule,
    ActivityStreamModule,
    SecurityModule,
    ScheduleModule.forRoot(),

    // Translation support
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang']), new AcceptLanguageResolver()],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FeatureGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, MetricsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
