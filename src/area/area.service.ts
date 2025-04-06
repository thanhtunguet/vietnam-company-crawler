import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from 'src/_entities';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { Like, Repository } from 'typeorm';

@Injectable()
export class AreaService implements OnModuleInit {
  private provinces: Province[] = [];

  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async onModuleInit() {
    this.provinces = await this.provinceRepository.find({
      relations: ['districts', 'districts.wards'],
    });
    console.log('Provinces loaded:', this.provinces.length);
  }

  async getProvinces(query: QueryFilterDto): Promise<Province[]> {
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

  async getProvince(id: number): Promise<Province | null> {
    return this.provinceRepository.findOne({
      where: { id },
      relations: ['districts', 'districts.wards'],
    });
  }
}
