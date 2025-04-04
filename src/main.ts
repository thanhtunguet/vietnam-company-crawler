import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { snakeCase } from 'lodash';
import { description, name, version } from '../package.json';
import { PORT } from './_config/dotenv';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle(snakeCase(name).toUpperCase())
    .setDescription(description)
    .setVersion(version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (process.env.ENABLE_CORS) {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });
  }

  await app
    .listen(PORT)
    .then(() => {
      console.log(`App is running on port ${PORT}`);
    })
    .catch((error) => {
      console.error('Error starting app', error);
    });
  return;
}

bootstrap();
