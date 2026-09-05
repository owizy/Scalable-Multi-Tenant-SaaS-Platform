import { Module } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { DataExportController } from './data-export.controller';
import { PiiScrubService } from './pii-scrub.service';

@Module({
  providers: [DataExportService, PiiScrubService],
  controllers: [DataExportController],
  exports: [DataExportService],
})
export class DataExportModule {}
