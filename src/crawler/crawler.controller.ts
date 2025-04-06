import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Crawler')
@Controller('/api/crawler')
export class CrawlerController {
  @Get('/')
  public index() {
    return {};
  }
}
