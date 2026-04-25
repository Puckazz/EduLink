import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationModule } from '../notification/notification.module';
import { ScoreModule } from '../score/score.module';

@Module({
  imports: [AttendanceModule, NotificationModule, ScoreModule],
  controllers: [MeController],
})
export class MeModule {}
