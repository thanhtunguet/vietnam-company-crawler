import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDto } from 'src/_dtos';
import { Company } from 'src/_entities';
import { CompanyFilterDto } from 'src/_filters/company-filter.dto';
import { AreaService } from 'src/area/area.service';
import { IsNull, Like, Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly areaService: AreaService,
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

  public async count(filter: CompanyFilterDto): Promise<number> {
    const { search, code, name, provinceId, districtId, wardId } = filter;

    const where = [];

    if (provinceId) {
      where.push({ provinceId });
    }

    if (districtId) {
      where.push({ districtId });
    }

    if (wardId) {
      where.push({ wardId });
    }

    if (search) {
      where.push({
        name: Like(`${search}%`),
      });
    } else {
      if (code) {
        where.push({ code: Like(`${code}%`) });
      }

      if (name) {
        where.push({ name: Like(`${name}%`) });
      }
    }

    return this.companyRepository.count({
      where,
    });
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

  public async reparseMissingDistricts(): Promise<{
    total: number;
    updated: number;
    failed: number;
  }> {
    const BATCH_SIZE = 400;
    const result = {
      total: 0,
      updated: 0,
      failed: 0,
    };

    // First get total count
    const totalCount = await this.companyRepository.count({
      where: { districtId: IsNull() },
    });
    result.total = totalCount;

    console.log(
      `Found ${totalCount} companies with missing district information`,
    );

    // Process in batches
    for (let skip = 0; skip < totalCount; skip += BATCH_SIZE) {
      console.log(
        `Processing batch ${skip / BATCH_SIZE + 1} of ${Math.ceil(
          totalCount / BATCH_SIZE,
        )}`,
      );

      const companies = await this.companyRepository.find({
        where: { districtId: IsNull() },
        select: ['id', 'name', 'address', 'provinceId', 'districtId', 'wardId'],
        skip,
        take: BATCH_SIZE,
      });

      for (const company of companies) {
        try {
          if (!company.address) {
            console.log(
              `Company ${company.id} (${company.name}) has no address`,
            );
            result.failed++;
            continue;
          }

          const { province, district, ward } = this.areaService.handleAddress(
            company.address,
          );

          const hasChanges =
            province?.id !== company.provinceId ||
            district?.id !== company.districtId ||
            ward?.id !== company.wardId;

          if (hasChanges) {
            await this.companyRepository.update(company.id, {
              provinceId: province?.id,
              districtId: district?.id,
              wardId: ward?.id,
            });
            result.updated++;
            console.log(
              `Updated company ${company.id} (${company.name}): ${company.address}`,
            );
          } else {
            console.log(
              `No changes needed for company ${company.id} (${company.name}): ${company.address}`,
            );
          }
        } catch (error: any) {
          console.error(
            `Failed to process company ${company.id} (${company.name}): ${
              error?.message || 'Unknown error'
            }`,
          );
          result.failed++;
        }
      }

      // Log batch progress
      console.log(
        `Batch ${skip / BATCH_SIZE + 1} completed. Progress: ${
          skip + companies.length
        }/${totalCount} ` +
          `(Updated: ${result.updated}, Failed: ${result.failed})`,
      );
    }

    console.log(
      `Reparsing completed. Total: ${result.total}, Updated: ${result.updated}, Failed: ${result.failed}`,
    );
    return result;
  }
}
