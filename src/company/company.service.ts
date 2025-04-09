import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDto } from 'src/_dtos';
import { Company } from 'src/_entities';
import { CompanyFilterDto } from 'src/_filters/company-filter.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  public async findAll(filter: CompanyFilterDto): Promise<Company[]> {
    const {
      skip = 0,
      take = 10,
      search,
      code,
      name,
      provinceId,
      districtId,
      wardId,
      orderBy = 'createdAt',
      order = 'DESC',
    } = filter;

    const queryBuilder = this.companyRepository.createQueryBuilder('company');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(company.name LIKE :search OR company.code LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply specific filters
    if (code) {
      queryBuilder.andWhere('company.code LIKE :code', { code: `%${code}%` });
    }

    if (name) {
      queryBuilder.andWhere('company.name LIKE :name', { name: `%${name}%` });
    }

    // Filter by administrative areas
    if (provinceId) {
      queryBuilder.andWhere('company.provinceId = :provinceId', { provinceId });
    }

    if (districtId) {
      queryBuilder.andWhere('company.districtId = :districtId', { districtId });
    }

    if (wardId) {
      queryBuilder.andWhere('company.wardId = :wardId', { wardId });
    }

    // Apply pagination and ordering
    queryBuilder.skip(skip).take(take).orderBy(`company.${orderBy}`, order);

    return queryBuilder.getMany();
  }

  public async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  public async create(companyDto: CompanyDto): Promise<Company> {
    const company = this.companyRepository.create(companyDto);
    return this.companyRepository.save(company);
  }

  public async update(id: number, companyDto: CompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    const updatedCompany = Object.assign(company, companyDto);
    return this.companyRepository.save(updatedCompany);
  }

  public async remove(id: number): Promise<boolean> {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return true;
  }

  public async companies(filter: CompanyFilterDto): Promise<Company[]> {
    return this.findAll(filter);
  }
}
