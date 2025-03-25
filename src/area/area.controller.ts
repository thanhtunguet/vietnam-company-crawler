import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryDto } from 'src/_dtos/query.dto';
import { ProvinceDto } from './dtos/province.dto';
import { AreaService } from './area.service';

@ApiTags('Areas')
@Controller('/api/area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Get('/list-provinces')
  @ApiResponse({
    status: 200,
    description: 'List of provinces',
    type: ProvinceDto,
    isArray: true,
  })
  public async listProvinces(@Query() { skip, take }: QueryDto): Promise<ProvinceDto[]> {
    return this.areaService.list({
      skip: skip || 0,
      take: take || 10,
    });
  }

  @Get('/count-provinces')
  @ApiResponse({
    status: 200,
    description: 'Count of provinces',
    type: Number,
  })
  public async countProvinces() {
    return this.areaService.count();
  }
}
