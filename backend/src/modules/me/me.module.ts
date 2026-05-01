import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationModule } from '../notification/notification.module';
import { ScoreModule } from '../score/score.module';
import { ClassSectionModule } from '../class-section/class-section.module';

@Module({
  imports: [AttendanceModule, NotificationModule, ScoreModule, ClassSectionModule],
  controllers: [MeController],
})
export class MeModule {}

