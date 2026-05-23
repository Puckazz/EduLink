import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../../common/upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
