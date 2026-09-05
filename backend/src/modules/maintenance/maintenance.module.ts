import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceService } from './maintenance.service';
import { ReportingModule } from '../reporting/reporting.module';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), ReportingModule, StorageModule],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
