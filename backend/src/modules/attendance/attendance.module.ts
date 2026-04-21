import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { ClassSectionService } from './class-section.service';
import { AttendanceSessionService } from './attendance-session.service';
import { ClassSectionController } from './class-section.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController, ClassSectionController],
  providers: [AttendanceService, ClassSectionService, AttendanceSessionService],
  exports: [AttendanceService, ClassSectionService, AttendanceSessionService],
})
export class AttendanceModule {}
