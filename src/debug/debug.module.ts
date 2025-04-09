import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from 'src/_entities';
import { DebugService } from './debug.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature(Object.values(entities)),
  ],
  providers: [DebugService],
  exports: [DebugService],
})
export class DebugModule {}
