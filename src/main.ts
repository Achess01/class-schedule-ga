import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ProblemDetailFilter } from './common/errors/problem-detail.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Class Schedule API')
    .setDescription('API for managing class schedules')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  app.useGlobalFilters(new ProblemDetailFilter());
  app.useGlobalInterceptors(new BigIntSerializerInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
