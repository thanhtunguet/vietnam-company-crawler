import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { snakeCase } from 'lodash';
import { description, name, version } from '../package.json';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';

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

  const configService: ConfigService<EnvironmentVariables> = app.get(
    ConfigService<EnvironmentVariables>,
  );

  if (configService.get('ENABLE_CORS')) {
    app.enableCors({
      origin: configService.get('CORS_ORIGIN'),
      credentials: true,
    });
  }

  const PORT = configService.get('PORT');

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
