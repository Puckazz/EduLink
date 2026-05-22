import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmProviderService } from './llm-provider.service';

@Module({
  imports: [PrismaModule, FeedbackModule],
  controllers: [AiController],
  providers: [AiService, LlmProviderService],
})
export class AiModule {}
