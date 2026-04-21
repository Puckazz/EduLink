import { Module } from '@nestjs/common';
import { ClassSectionService } from './class-section.service';
import { AttendanceSessionService } from './attendance-session.service';
import { ClassSectionController } from './class-section.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClassSectionController],
  providers: [ClassSectionService, AttendanceSessionService],
  exports: [ClassSectionService, AttendanceSessionService],
})
export class ClassSectionModule {}
