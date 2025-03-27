import { ApiProperty } from '@nestjs/swagger';

export class CrawlPageDto {
  @ApiProperty({
    type: 'number',
  })
  pageNumber: number;

  @ApiProperty({
    type: 'string',
  })
  province: string;
}
