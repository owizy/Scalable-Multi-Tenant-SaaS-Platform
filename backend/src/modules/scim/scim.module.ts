import { Module } from '@nestjs/common';
import { ScimUserController } from './scim.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ScimUserController],
})
export class ScimModule {}
