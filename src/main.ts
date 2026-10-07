import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ServerResponse } from 'node:http';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  AttachmentStorageService,
  PUBLIC_UPLOADS_PREFIX,
} from './attachments/attachment-storage.service';
import { createValidationException } from './common/validation/create-validation-exception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  // Public uploads are served outside the /api prefix. File names are uuids,
  // and nosniff stops browsers from interpreting them as another content type.
  app.useStaticAssets(app.get(AttachmentStorageService).rootDir, {
    prefix: `${PUBLIC_UPLOADS_PREFIX}/`,
    index: false,
    dotfiles: 'deny',
    setHeaders: (response: ServerResponse) => {
      response.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Medium News API')
    .setDescription('API documentation for the Medium News application')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Use the format: Token <jwt>',
      },
      'token',
    )
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory, {
    customSiteTitle: 'Medium News API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
