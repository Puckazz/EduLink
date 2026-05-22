import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(cookieParser());

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;

  const config = new DocumentBuilder()
    .setTitle('EduLink API')
    .setDescription('The EduLink API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  logger.log(`📄 Swagger UI đang chạy tại http://localhost:${port}/api/docs`);
}
bootstrap();
