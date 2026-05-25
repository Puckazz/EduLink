import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AcademicTermController } from './academic-term.controller';
import { AcademicTermService } from './academic-term.service';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicTermController],
  providers: [AcademicTermService],
  exports: [AcademicTermService],
})
export class AcademicTermModule {}
