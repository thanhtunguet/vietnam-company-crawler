import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AreaService } from './area.service';
import {
  DistrictDto,
  HttpErrorDto,
  ProvinceDto,
  QueryDto,
  WardDto,
} from 'src/_dtos';

@ApiTags('Areas')
@Controller('/api/area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Get('/provinces')
  @ApiResponse({
    status: 200,
    description: 'List of provinces',
    type: ProvinceDto,
    isArray: true,
  })
  public async provinces(
    @Query() { skip, take }: QueryDto,
  ): Promise<ProvinceDto[]> {
    return this.areaService.list({
      skip: skip || 0,
      take: take || 10,
    });
  }

  @Get('/provinces/count')
  @ApiResponse({
    status: 200,
    description: 'Count of provinces',
    type: Number,
  })
  public async countProvinces() {
    return this.areaService.count();
  }

  @Get('/provinces/:provinceId')
  @ApiResponse({
    type: ProvinceDto,
    status: 200,
    description: 'Get province by ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Province not found',
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Province ID is required',
    type: HttpErrorDto,
  })
  public async province(
    @Param('provinceId') provinceId: number,
  ): Promise<ProvinceDto> {
    if (!provinceId) {
      throw new HttpException(
        {
          message: 'Province ID is required',
          status: 'error',
          code: 'PROVINCE_ID_REQUIRED',
        },
        400,
        {
          description: 'Province ID is required',
        },
      );
    }
    provinceId = Number(provinceId);
    try {
      return await this.areaService.getProvince(provinceId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Province not found',
          status: 'error',
          code: 'PROVINCE_NOT_FOUND',
        },
        404,
        {
          description: 'Province not found',
        },
      );
    }
  }

  @Get('/provinces/:provinceId/districts')
  @ApiResponse({
    type: DistrictDto,
    status: 200,
    description: 'Get districts by province ID',
  })
  public async districts(
    @Param('provinceId') provinceId: number,
  ): Promise<DistrictDto[]> {
    if (!provinceId) {
      throw new HttpException(
        {
          message: 'Province ID is required',
          status: 'error',
          code: 'PROVINCE_ID_REQUIRED',
        },
        400,
        {
          description: 'Province ID is required',
        },
      );
    }
    provinceId = Number(provinceId);
    try {
      return await this.areaService.getDistrictsByProvinceId(provinceId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Districts not found',
          status: 'error',
          code: 'DISTRICTS_NOT_FOUND',
        },
        404,
        {
          description: 'Districts not found',
        },
      );
    }
  }

  @Get('/provinces/:provinceId/districts/:districtId')
  @ApiResponse({
    type: DistrictDto,
    status: 200,
    description: 'Get district by ID',
  })
  @ApiResponse({
    status: 404,
    description: 'District not found',
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'District ID is required',
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Province ID is required',
    type: HttpErrorDto,
  })
  public async getDistrict(
    @Param('provinceId') provinceId: number,
    @Param('districtId') districtId: number,
  ): Promise<DistrictDto> {
    if (!provinceId) {
      throw new HttpException(
        {
          message: 'Province ID is required',
          status: 'error',
          code: 'PROVINCE_ID_REQUIRED',
        },
        400,
        {
          description: 'Province ID is required',
        },
      );
    }
    if (!districtId) {
      throw new HttpException(
        {
          message: 'District ID is required',
          status: 'error',
          code: 'DISTRICT_ID_REQUIRED',
        },
        400,
        {
          description: 'District ID is required',
        },
      );
    }
    provinceId = Number(provinceId);
    districtId = Number(districtId);
    try {
      return this.areaService.getDistrict(districtId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'District not found',
          status: 'error',
          code: 'DISTRICT_NOT_FOUND',
        },
        404,
        {
          description: 'District not found',
        },
      );
    }
  }

  @Get('/provinces/:provinceId/districts/:districtId/wards')
  public async wards(
    @Param('provinceId') provinceId: number,
    @Param('districtId') districtId: number,
  ): Promise<WardDto[]> {
    if (!provinceId) {
      throw new HttpException(
        {
          message: 'Province ID is required',
          status: 'error',
          code: 'PROVINCE_ID_REQUIRED',
        },
        400,
        {
          description: 'Province ID is required',
        },
      );
    }
    if (!districtId) {
      throw new HttpException(
        {
          message: 'District ID is required',
          status: 'error',
          code: 'DISTRICT_ID_REQUIRED',
        },
        400,
        {
          description: 'District ID is required',
        },
      );
    }
    provinceId = Number(provinceId);
    districtId = Number(districtId);
    try {
      return this.areaService.getWards(districtId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Wards not found',
          status: 'error',
          code: 'WARDS_NOT_FOUND',
        },
        404,
        {
          description: 'Wards not found',
        },
      );
    }
  }

  @Get('/provinces/:provinceId/districts/:districtId/wards/:wardId')
  @ApiResponse({
    type: WardDto,
    status: 200,
    description: 'Get ward by ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Ward not found',
    type: HttpErrorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ward ID is required',
    type: HttpErrorDto,
  })
  public async ward(
    @Param('provinceId') provinceId: number,
    @Param('districtId') districtId: number,
    @Param('wardId') wardId: number,
  ): Promise<WardDto> {
    if (!provinceId) {
      throw new HttpException(
        {
          message: 'Province ID is required',
          status: 'error',
          code: 'PROVINCE_ID_REQUIRED',
        },
        400,
        {
          description: 'Province ID is required',
        },
      );
    }
    if (!districtId) {
      throw new HttpException(
        {
          message: 'District ID is required',
          status: 'error',
          code: 'DISTRICT_ID_REQUIRED',
        },
        400,
        {
          description: 'District ID is required',
        },
      );
    }
    if (!wardId) {
      throw new HttpException(
        {
          message: 'Ward ID is required',
          status: 'error',
          code: 'WARD_ID_REQUIRED',
        },
        400,
        {
          description: 'Ward ID is required',
        },
      );
    }
    provinceId = Number(provinceId);
    districtId = Number(districtId);
    wardId = Number(wardId);
    try {
      return this.areaService.ward(wardId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Ward not found',
          status: 'error',
          code: 'WARD_NOT_FOUND',
        },
        404,
        {
          description: 'Ward not found',
        },
      );
    }
  }
}
