import './tracing';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { WinstonConfig } from './infrastructure/logger/winston.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: WinstonConfig,
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  // Security Headers (Helmet)
  app.use(helmet());

  // API Versioning (/api/v1)
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Tenant SaaS API')
    .setDescription('Enterprise Multi-Tenant SaaS Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global Guards & Filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Restricted CORS Configuration
  const allowedOrigins = configService.get<string>(
    'ALLOWED_ORIGINS',
    'http://localhost:3000',
  );
  app.enableCors({
    origin: allowedOrigins.includes(',')
      ? allowedOrigins.split(',')
      : allowedOrigins,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}
void bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
