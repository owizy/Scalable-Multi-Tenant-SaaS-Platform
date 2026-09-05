import { Module, Global } from '@nestjs/common';
import { AiAssistantService } from './ai.service';
import { AiController } from './ai.controller';

@Global()
@Module({
  providers: [AiAssistantService],
  controllers: [AiController],
  exports: [AiAssistantService],
})
export class AiModule {}
