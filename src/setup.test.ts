import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import * as allEntities from 'src/_entities';
import { EnvironmentVariables } from 'src/_types/EnvironmentVariables';
import { validateConfiguration } from './_config/config';

config();

const entities = Object.values(allEntities);

export const setupDatabase = async ({
  imports = [],
  controllers = [],
  providers = [],
}: {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
}) => {
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
          synchronize: false,
          logging: false,
          entities,
          extra: {
            trustServerCertificate: true,
          },
        }),
      }),
      TypeOrmModule.forFeature(entities),
      ...imports,
    ],
    controllers,
    providers,
  }).compile();
};
