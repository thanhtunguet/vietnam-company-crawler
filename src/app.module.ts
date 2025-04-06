import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from 'src/_entities';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';
import { OpenaiModule } from './openai/openai.module';
import { AreaModule } from './area/area.module';
import { CompanyModule } from './company/company.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: {
        DB_HOST: 'string',
        DB_PORT: 'number',
      },
      validate(config: EnvironmentVariables) {
        const requiredEnvVars = [
          'DB_HOST',
          'DB_USER',
          'DB_NAME',
          'NODE_ENV',
          'OPENAI_API_KEY',
          'OPENAI_BASE_URL',
          'OPENAI_MODEL',
        ];

        for (const envVar of requiredEnvVars) {
          if (!config[envVar]) {
            throw new Error(`${envVar} is required`);
          }
        }

        // Convert boolean strings to actual booleans
        if (config.DB_SYNCHRONIZE !== undefined) {
          config.DB_SYNCHRONIZE =
            config.DB_SYNCHRONIZE === true || config.DB_SYNCHRONIZE === 'true';
        }

        if (config.DB_LOGGING !== undefined) {
          config.DB_LOGGING =
            config.DB_LOGGING === true || config.DB_LOGGING === 'true';
        }

        // Convert numeric strings to numbers
        if (config.SLEEP_GAP !== undefined) {
          config.SLEEP_GAP = Number(config.SLEEP_GAP);
        }

        if (config.SLEEP_MIN !== undefined) {
          config.SLEEP_MIN = Number(config.SLEEP_MIN);
        }

        // Convert DB_PORT to number
        if (config.DB_PORT !== undefined) {
          config.DB_PORT = Number(config.DB_PORT);
        }

        // Convert PORT to number
        if (config.PORT !== undefined) {
          config.PORT = Number(config.PORT);
        }

        // Convert RABBITMQ_PORT to number
        if (config.RABBITMQ_PORT !== undefined) {
          config.RABBITMQ_PORT = Number(config.RABBITMQ_PORT);
        }

        return config;
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('DB_SYNCHRONIZE'), // Set to false in production
        logging: config.get<boolean>('DB_LOGGING'), // Set to false in production
        entities: Object.values(entities),
        extra: {
          trustServerCertificate: true,
        },
      }),
    }),
    OpenaiModule,
    AreaModule,
    CompanyModule,
    CrawlerModule,
  ],
})
export class AppModule {}
