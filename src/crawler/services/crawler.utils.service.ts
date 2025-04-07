import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sleep } from 'openai/core';

@Injectable()
export class CralwerUtilsService {
  constructor(private readonly configService: ConfigService) {}

  public async sleep() {
    const ms =
      Math.random() * this.configService.get<number>('SLEEP_GAP') +
      this.configService.get<number>('SLEEP_GAP');
    console.log('Sleeping for', ms, 'ms');
    await sleep(ms);
  }
}
