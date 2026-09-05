import { Module, Global } from '@nestjs/common';
import { UsageService } from './usage.service';
import { UsageGuard } from './usage.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [UsageService, UsageGuard],
  exports: [UsageService, UsageGuard],
})
export class UsageModule {}
