import { Module } from '@nestjs/common';
import { AutoGuardService } from './auto-guard.service';

@Module({
  providers: [AutoGuardService],
  exports: [AutoGuardService],
})
export class SecurityModule {}
