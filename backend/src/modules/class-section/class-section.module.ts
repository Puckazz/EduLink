import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClassSectionService } from './class-section.service';
import { AttendanceSessionService } from './attendance-session.service';
import { ImportClassSectionService } from './import-class-section.service';
import { ClassSectionController } from './class-section.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [ClassSectionController],
  providers: [
    ClassSectionService,
    AttendanceSessionService,
    ImportClassSectionService,
  ],
  exports: [
    ClassSectionService,
    AttendanceSessionService,
    ImportClassSectionService,
  ],
})
export class ClassSectionModule {}
