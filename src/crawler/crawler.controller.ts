import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrawlerService } from './crawler.service';

@ApiTags('Crawler')
@Controller('/api/crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}
}
