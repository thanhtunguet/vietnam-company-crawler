import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryDto } from 'src/_dtos/query.dto';
import { ProvinceDto } from './dtos/province.dto';
import { ProvinceService } from './province.service';

@ApiTags('Province')
@Controller('/api/province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get('/list')
  @ApiResponse({
    status: 200,
    description: 'List of provinces',
    type: ProvinceDto,
    isArray: true,
  })
  public async list(@Query() { skip, take }: QueryDto): Promise<ProvinceDto[]> {
    return this.provinceService.list({
      skip: skip || 0,
      take: take || 10,
    });
  }

  @Get('/count')
  @ApiResponse({
    status: 200,
    description: 'Count of provinces',
    type: Number,
  })
  public async count() {
    return this.provinceService.count();
  }
}
