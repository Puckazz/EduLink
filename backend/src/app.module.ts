import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ParentModule } from './modules/parent/parent.module';
import { StudentModule } from './modules/student/student.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ScoreModule } from './modules/score/score.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ClassSectionModule } from './modules/class-section/class-section.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { MajorModule } from './modules/major/major.module';
import { MeModule } from './modules/me/me.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { FaqModule } from './modules/faq/faq.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting: global default 100 req / 60s
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    AdminModule,
    ParentModule,
    StudentModule,
    SubjectModule,
    ScoreModule,
    AttendanceModule,
    ClassSectionModule,
    NotificationModule,
    FeedbackModule,
    MajorModule,
    MeModule,
    DashboardModule,
    AiModule,
    FaqModule,
  ],
  controllers: [],
  providers: [
    // Enable ThrottlerGuard globally so @Throttle/@SkipThrottle work everywhere
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
