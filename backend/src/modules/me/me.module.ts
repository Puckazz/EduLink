import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationModule } from '../notification/notification.module';
import { ScoreModule } from '../score/score.module';
import { ClassSectionModule } from '../class-section/class-section.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../../common/upload/upload.module';

@Module({
  imports: [
    PrismaModule,
    AttendanceModule,
    NotificationModule,
    ScoreModule,
    ClassSectionModule,
    UploadModule,
  ],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}
