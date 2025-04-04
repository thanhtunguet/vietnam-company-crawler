import { ApiProperty } from '@nestjs/swagger';
import { ProvinceInfo } from '../crawler-service/get-provinces';

export class ProvinceInfoDto implements ProvinceInfo {
  @ApiProperty({
    description: 'Name of the province',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'URL of the province',
    type: String,
  })
  url: string;

  @ApiProperty({
    description: 'Number of pages in the province',
    type: Number,
  })
  pages: number;
}
