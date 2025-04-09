import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProvinceDto } from 'src/_dtos';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { AreaService } from './area.service';

@ApiTags('Administrative Areas')
@Controller('/api/area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @ApiResponse({
    type: [ProvinceDto],
    description: 'List of provinces',
    status: 200,
  })
  @Get('/provinces')
  public async provinces(
    @Query() query: QueryFilterDto,
  ): Promise<ProvinceDto[]> {
    return this.areaService.getProvinces(query);
  }

  @ApiResponse({
    type: ProvinceDto,
    description: 'Province details',
    status: 200,
  })
  @Get('/provinces/:provinceId')
  public async province(
    @Param('provinceId') provinceId: string,
  ): Promise<ProvinceDto> {
    const province = await this.areaService.getProvince(Number(provinceId));
    if (!province) {
      throw new Error('Province not found');
    }
    return province;
  }
}
