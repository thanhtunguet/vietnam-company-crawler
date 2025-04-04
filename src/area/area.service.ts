import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District, Province, Ward } from 'src/_entities';
import { QueryDto } from 'src/_dtos/query.dto';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  public async list({ skip, take }: QueryDto): Promise<Province[]> {
    return this.provinceRepository.find({
      skip,
      take,
    });
  }

  public async count(): Promise<number> {
    return this.provinceRepository.count();
  }

  public async getProvince(provinceId: number): Promise<Province> {
    return this.provinceRepository.findOne({
      where: { id: provinceId },
      relations: ['districts', 'districts.wards'],
    });
  }

  public async getDistrictsByProvinceId(
    provinceId: number,
  ): Promise<District[]> {
    return this.districtRepository.find({
      where: { provinceId },
      relations: ['wards', 'province'],
    });
  }

  public async getDistrict(districtId: number): Promise<District> {
    return this.districtRepository.findOne({
      where: { id: districtId },
      relations: ['wards', 'province'],
    });
  }

  public async getWards(districtId: number): Promise<Ward[]> {
    return this.wardRepository.find({
      where: { districtId },
      relations: ['district', 'district.province'],
    });
  }

  public async ward(wardId: number): Promise<Ward | null> {
    return this.wardRepository.findOne({
      where: { id: wardId },
      relations: ['district', 'district.province'],
    });
  }
}
