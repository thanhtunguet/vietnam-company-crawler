import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from 'src/_entities';
import { QueryDto } from 'src/_dtos/query.dto';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
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
}
