import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddressDto, DistrictDto, ProvinceDto, ProvinceWithCompanyCountDto, WardDto } from 'src/_dtos';
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
    type: [ProvinceWithCompanyCountDto],
    description: 'List of provinces with company counts',
    status: 200,
  })
  @Get('/provinces/with-company-count')
  public async provincesWithCompanyCount(
    @Query() query: QueryFilterDto,
  ): Promise<ProvinceWithCompanyCountDto[]> {
    return this.areaService.getProvincesWithCompanyCount(query);
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

  @ApiResponse({
    type: [DistrictDto],
    description: 'List of districts',
    status: 200,
  })
  @Get('/districts')
  public async districts(
    @Query() query: QueryFilterDto,
  ): Promise<DistrictDto[]> {
    return this.areaService.getDistricts(query);
  }

  @ApiResponse({
    type: DistrictDto,
    description: 'District details',
    status: 200,
  })
  @Get('/districts/:districtId')
  public async district(
    @Param('districtId') districtId: string,
  ): Promise<DistrictDto> {
    const district = await this.areaService.getDistrict(Number(districtId));
    if (!district) {
      throw new Error('District not found');
    }
    return district;
  }

  @ApiResponse({
    type: [DistrictDto],
    description: 'List of districts in a province',
    status: 200,
  })
  @Get('/provinces/:provinceId/districts')
  public async districtsByProvince(
    @Param('provinceId') provinceId: string,
    @Query() query: QueryFilterDto,
  ): Promise<DistrictDto[]> {
    return this.areaService.getDistrictsByProvince(Number(provinceId), query);
  }

  @ApiResponse({
    type: [WardDto],
    description: 'List of wards',
    status: 200,
  })
  @Get('/wards')
  public async wards(@Query() query: QueryFilterDto): Promise<WardDto[]> {
    return this.areaService.getWards(query);
  }

  @ApiResponse({
    type: WardDto,
    description: 'Ward details',
    status: 200,
  })
  @Get('/wards/:wardId')
  public async ward(@Param('wardId') wardId: string): Promise<WardDto> {
    const ward = await this.areaService.getWard(Number(wardId));
    if (!ward) {
      throw new Error('Ward not found');
    }
    return ward;
  }

  @ApiResponse({
    type: [WardDto],
    description: 'List of wards in a district',
    status: 200,
  })
  @Get('/districts/:districtId/wards')
  public async wardsByDistrict(
    @Param('districtId') districtId: string,
    @Query() query: QueryFilterDto,
  ): Promise<WardDto[]> {
    return this.areaService.getWardsByDistrict(Number(districtId), query);
  }

  @ApiResponse({
    type: AddressDto,
    description: 'Parse address string to find province, district and ward',
    status: 200,
  })
  @Get('/parse-address')
  public async parseAddress(
    @Query('address') address: string,
  ): Promise<AddressDto> {
    if (!address) {
      throw new Error('Address parameter is required');
    }
    return this.areaService.handleAddress(address);
  }
}
