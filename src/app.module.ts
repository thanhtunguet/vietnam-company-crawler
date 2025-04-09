import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from 'src/_entities';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';
import { validateConfiguration } from './_config/config';
import { AreaModule } from './area/area.module';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { CompanyModule } from './company/company.module';
import { CrawlerModule } from './crawler/crawler.module';
import { DebugModule } from './debug/debug.module';
import { OpenaiModule } from './openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfiguration,
    }),
    ScheduleModule.forRoot(),
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
    DebugModule,
    AuthModule,
    AreaModule,
    BusinessModule,
    CompanyModule,
    OpenaiModule,
    CrawlerModule,
  ],
  providers: [],
})
export class AppModule {}
