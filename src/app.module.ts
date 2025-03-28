import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from './_config/dotenv';
import * as entities from './_entities';
import { StaticRepository } from './_repositories/static-repository';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlerModule } from './crawler/crawler.module';
import { CompanyModule } from './company/company.module';
import { AreaModule as AreaModule } from './area/area.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: Object.values(entities),
      synchronize: false,
      extra: {
        trustServerCertificate: true,
      },
    }),
    AreaModule,
    CompanyModule,
    CrawlerModule,
  ],
  controllers: [AppController],
  providers: [AppService, StaticRepository],
  exports: [],
})
export class AppModule {}
