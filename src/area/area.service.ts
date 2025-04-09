import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District, Province, Ward } from 'src/_entities';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { vietnameseSlugify } from 'src/_helpers/slugify';
import { Like, Repository } from 'typeorm';

@Injectable()
export class AreaService implements OnModuleInit {
  public static getBaseProvinceName(provinceName: string): string {
    return provinceName
      .replace(/Tỉnh\s|Thành phố\s|TP\.*\s*/, '')
      .toLowerCase()
      .trim();
  }

  public static getBaseDistrictName(districtName: string): string {
    return districtName
      .replace(/Huyện\s|Quận\s|Thị xã\s|Thành phố\s*|TP\.?\s*/, '')
      .toLowerCase()
      .trim();
  }

  public static getBaseWardName(wardName: string): string {
    return wardName
      .replace(/Phường\s|Xã\s|Thị trấn\s*/, '')
      .toLowerCase()
      .trim();
  }

  public provinces: Record<string, Province> = {};

  public districts: Record<string, District> = {};

  public wards: Record<string, Ward> = {};

  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  public async onModuleInit() {
    await this.provinceRepository.find().then((provinces) => {
      const provinceMap = Object.fromEntries(
        provinces.map((p) => {
          const key = vietnameseSlugify(
            AreaService.getBaseProvinceName(p.name),
          );
          return [key, p];
        }),
      );

      this.provinces = provinceMap;
      Object.freeze(this.provinces);
    });
    console.log('All provinces loaded');
    await this.districtRepository.find().then((districts) => {
      const districtMap = Object.fromEntries(
        districts.map((d) => {
          const key = vietnameseSlugify(
            AreaService.getBaseDistrictName(d.name),
          );
          return [key, d];
        }),
      );

      this.districts = districtMap;
      Object.freeze(this.districts);
    });
    console.log('All districts loaded');

    await this.wardRepository.find().then((wards) => {
      const wardMap = Object.fromEntries(
        wards.map((w) => {
          const key = vietnameseSlugify(AreaService.getBaseWardName(w.name));
          return [key, w];
        }),
      );

      this.wards = wardMap;
      Object.freeze(this.wards);
    });
    console.log('All wards loaded');
  }

  public async getProvinces(query: QueryFilterDto): Promise<Province[]> {
    const { skip, take, search, orderBy, order } = query;
    const where = [];
    if (search) {
      where.push({
        name: Like(`%${search}%`),
      });
      where.push({
        code: Like(`${search}%`),
      });
    }
    const orderQuery = {};
    if (orderBy) {
      orderQuery[orderBy] = order;
    }
    return this.provinceRepository.find({
      skip,
      take,
      order: orderQuery,
      where,
    });
  }

  public async getProvince(id: number): Promise<Province | null> {
    return this.provinceRepository.findOne({
      where: { id },
      relations: ['districts', 'districts.wards'],
    });
  }

  public async getDistricts(query: QueryFilterDto): Promise<District[]> {
    const { skip, take, search, orderBy, order } = query;
    const where = [];
    if (search) {
      where.push({
        name: Like(`%${search}%`),
      });
      where.push({
        code: Like(`${search}%`),
      });
    }
    const orderQuery = {};
    if (orderBy) {
      orderQuery[orderBy] = order;
    }
    return this.districtRepository.find({
      skip,
      take,
      order: orderQuery,
      where,
      relations: ['province'],
    });
  }

  public async getDistrict(id: number): Promise<District | null> {
    return this.districtRepository.findOne({
      where: { id },
      relations: ['province', 'wards'],
    });
  }

  public async getDistrictsByProvince(
    provinceId: number,
    query: QueryFilterDto,
  ): Promise<District[]> {
    const { skip, take, search, orderBy, order } = query;
    const where: any = { province: { id: provinceId } };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const orderQuery = {};
    if (orderBy) {
      orderQuery[orderBy] = order;
    }

    return this.districtRepository.find({
      where,
      skip,
      take,
      order: orderQuery,
      relations: ['province'],
    });
  }

  public async getWards(query: QueryFilterDto): Promise<Ward[]> {
    const { skip, take, search, orderBy, order } = query;
    const where = [];
    if (search) {
      where.push({
        name: Like(`%${search}%`),
      });
      where.push({
        code: Like(`${search}%`),
      });
    }
    const orderQuery = {};
    if (orderBy) {
      orderQuery[orderBy] = order;
    }
    return this.wardRepository.find({
      skip,
      take,
      order: orderQuery,
      where,
      relations: ['district', 'district.province'],
    });
  }

  public async getWard(id: number): Promise<Ward | null> {
    return this.wardRepository.findOne({
      where: { id },
      relations: ['district', 'district.province'],
    });
  }

  public async getWardsByDistrict(
    districtId: number,
    query: QueryFilterDto,
  ): Promise<Ward[]> {
    const { skip, take, search, orderBy, order } = query;
    const where: any = { district: { id: districtId } };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const orderQuery = {};
    if (orderBy) {
      orderQuery[orderBy] = order;
    }

    return this.wardRepository.find({
      where,
      skip,
      take,
      order: orderQuery,
      relations: ['district', 'district.province'],
    });
  }
}
