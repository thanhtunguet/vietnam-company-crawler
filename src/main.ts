import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { AppMode, MODE, MQTT_URL, PORT } from './_config/dotenv';
import { AppModule } from './app.module';
import { name, version, description } from '../package.json';
import { snakeCase } from 'react3l';

async function bootstrap() {
  if (MODE === AppMode.APP) {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    // Authentication & Session
    app.use(
      session({
        secret: process.env.SECRET_KEY, // to sign session id
        saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
        resave: false,
        rolling: true, // keep session alive
        cookie: {
          maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
          rolling: true,
          httpOnly: true, // so that cookie can't be accessed via client-side script
        },
      }),
    );

    if (process.env.NODE_ENV === 'development') {
      const config = new DocumentBuilder()
        .setTitle(snakeCase(name).toUpperCase())
        .setDescription(description)
        .setVersion(version)
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document);
    }

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

  if (MODE === AppMode.CRAWLER) {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.MQTT,
        options: {
          url: MQTT_URL,
        },
      },
    );
    await app.listen().then(() => {
      console.log('Crawler is running');
    });
  }
}

bootstrap();
