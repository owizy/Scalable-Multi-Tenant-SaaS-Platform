import { Module, Global } from '@nestjs/common';
import { VendorAdminService } from './vendor-admin.service';
import { VendorAdminController } from './vendor-admin.controller';

@Global()
@Module({
  providers: [VendorAdminService],
  controllers: [VendorAdminController],
  exports: [VendorAdminService],
})
export class VendorAdminModule {}
