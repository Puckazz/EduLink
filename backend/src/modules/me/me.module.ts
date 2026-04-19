import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AttendanceModule, NotificationModule],
  controllers: [MeController],
})
export class MeModule {}
