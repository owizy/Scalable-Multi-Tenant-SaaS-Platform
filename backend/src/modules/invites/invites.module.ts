import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { AbilityModule } from '../ability/ability.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AbilityModule, AuthModule],
  providers: [InvitesService],
  controllers: [InvitesController],
  exports: [InvitesService],
})
export class InvitesModule {}
