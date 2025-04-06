import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import * as allEntities from 'src/_entities';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';
import { AreaModule } from 'src/area/area.module';
import { validateConfiguration } from './_config/config';

config();

const entities = Object.values(allEntities);

export const setupDatabase = async (providers: any[]) => {
  return await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRootAsync({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            validationOptions: {
              DB_HOST: 'string',
              DB_PORT: 'number',
            },
            validate: validateConfiguration,
          }),
        ],
        inject: [ConfigService],
        useFactory: (config: ConfigService<EnvironmentVariables>) => ({
          type: 'mssql',
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<number>('DB_PORT')),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: config.get<any>('DB_SYNCHRONIZE') === 'true', // Set to false in production
          logging: config.get<boolean>('DB_LOGGING'), // Set to false in production
          entities,
          extra: {
            trustServerCertificate: true,
          },
        }),
      }),
      TypeOrmModule.forFeature(entities),
      AreaModule,
    ],
    providers,
  }).compile();
};
