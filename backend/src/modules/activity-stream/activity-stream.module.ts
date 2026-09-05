import { Module } from '@nestjs/common';
import { ActivityStreamController } from '../notifications/activity-stream.controller';

@Module({
  controllers: [ActivityStreamController],
})
export class ActivityStreamModule {}
