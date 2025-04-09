import { ApiProperty } from '@nestjs/swagger';
import { District, Province, Ward, type Company } from 'src/_entities';
import { In, type Repository } from 'typeorm';

export class ProvinceData {
  @ApiProperty({
    type: Number,
  })
  name: string;

  @ApiProperty({
    type: Number,
  })
  link: string;

  @ApiProperty({
    type: Number,
  })
  numberOfPages: number;

  @ApiProperty({
    type: Number,
  })
  totalCompanies: number;
}

export class CompanyDetails {
  id?: number;

  name?: string;

  taxCode?: string;

  link?: string;

  address?: string;

  representative?: string;

  issuedAt?: Date;

  province?: Province;

  district?: District;

  ward?: Ward;
}

export abstract class AbstractCrawlerAdapter {
  constructor(protected readonly companyRepository: Repository<Company>) {}

  static getCompanyIdFromTaxCode(taxCode: string) {
    return Number(taxCode.replace(/-/g, ''));
  }

  protected abstract getCompanySlug(link: string): string;

  public abstract getProvinceData(): Promise<ProvinceData[]>;

  public abstract extractCompaniesFromPage(
    province: ProvinceData,
    page: number,
  ): Promise<Partial<CompanyDetails>[]>;

  public abstract extractCompanyDetails(
    companyDetails: Partial<CompanyDetails>,
  ): Promise<Company>;

  public async crawlAll() {
    try {
      const provinces = await this.getProvinceData();

      const concurrentPages = 2;

      for (const province of provinces) {
        for (
          let page = 1;
          page <= province.numberOfPages;
          page += concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page < province.numberOfPages) {
            jobs.push(this.crawlPage(province, page + 1));
          }
          await Promise.all(jobs);
          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
        }
      }
    } catch (error) {
      console.error('Error during crawling:', error);
    }
  }

  private readonly crawlPage = async (province: ProvinceData, page: number) => {
    const companiesOnPage = await this.extractCompaniesFromPage(province, page);
    const companies = await Promise.all(
      companiesOnPage.map(async (company) => {
        return this.extractCompanyDetails(company);
      }),
    );

    const ids = companies.map((company) => {
      return company.id;
    });

    const existingCompanies = await this.companyRepository.find({
      where: {
        id: In(ids),
      },
    });

    const existingCompaniesMap = this.toCompanyMap(existingCompanies);

    companies.forEach((company) => {
      if (existingCompaniesMap[Number(company.id)]) {
        Object.assign<Company, Company>(
          existingCompaniesMap[Number(company.id)],
          company,
        );
      }
    });

    try {
      if (existingCompanies.length) {
        await this.companyRepository.delete(
          existingCompanies.map((company) => company.id),
        );
        console.log(
          `Deleted ${existingCompanies.length} existing companies on page ${page} of province ${province.name}`,
        );
      }
    } catch (error) {
      console.log('Upsert error:', error);
    }
    try {
      if (companies.length) {
        await this.companyRepository.save(companies);
        console.log(
          `Saved ${companies.length} new companies on page ${page} of province ${province.name}`,
        );
      }
    } catch (error) {
      console.log('Save error:', error);
    }
  };

  private toCompanyMap(companies: Company[]): Record<number, Company> {
    return companies.reduce<Record<number, Company>>(
      (map: Record<number, Company>, company) => {
        map[Number(company.id)] = company;
        return map;
      },
      {},
    );
  }
}
