import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Business, Company } from 'src/_entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  public async list(skip: number, take: number): Promise<Business[]> {
    return this.businessRepository.find({
      skip,
      take,
    });
  }

  public async getBusiness(businessId: number): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: {
        id: businessId,
      },
    });
  }

  public async getCompaniesByBusiness(
    businessId: number,
    skip: number,
    take: number,
  ): Promise<Company[]> {
    return this.dataSource
      .createQueryBuilder()
      .select('company')
      .from(Company, 'company')
      .innerJoin('company.businesses', 'business')
      .where('business.id = :businessId', { businessId })
      .skip(skip)
      .take(take)
      .getMany();
  }

  public async countCompanyByBusiness(businessId: number): Promise<number> {
    return this.dataSource
      .createQueryBuilder()
      .select('COUNT(company.id)', 'count')
      .from(Company, 'company')
      .innerJoin('company.businesses', 'business')
      .where('business.id = :businessId', { businessId })
      .getRawOne()
      .then((result) => result.count);
  }
}
