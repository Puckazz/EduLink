import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmProviderService } from './llm-provider.service';
import { AiContextBuilder } from './ai-context.builder';

@Module({
  imports: [PrismaModule, FeedbackModule],
  controllers: [AiController],
  providers: [AiService, LlmProviderService, AiContextBuilder],
})
export class AiModule {}
