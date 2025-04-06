import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/_entities';
import { QueryFilterDto } from 'src/_filters/query-filter.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  public async companies(queryFilter: QueryFilterDto): Promise<Company[]> {
    const { skip = 0, take = 10 } = queryFilter;
    return this.companyRepository.find({
      skip,
      take,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
