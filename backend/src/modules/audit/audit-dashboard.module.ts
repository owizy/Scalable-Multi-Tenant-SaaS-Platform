import { Module, Global } from '@nestjs/common';
import { AuditDashboardService } from './audit-dashboard.service';
import { AuditDashboardController } from './audit-dashboard.controller';

@Global()
@Module({
  providers: [AuditDashboardService],
  controllers: [AuditDashboardController],
  exports: [AuditDashboardService],
})
export class AuditDashboardModule {}
