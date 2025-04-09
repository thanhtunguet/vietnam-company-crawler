import { type Company } from 'src/_entities';
import { In, type Repository } from 'typeorm';
import type { CompanyDetails } from '../dtos/company-details.dto';
import type { ProvinceData } from '../dtos/province-data.dto';

const concurrentPages = 6;

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

  // Track crawling progress
  protected crawlingProgress: Record<
    string,
    {
      lastPage: number;
      lastUpdated: Date;
    }
  > = {};

  public async crawlAll() {
    try {
      const provinces = await this.getProvinceData();

      for (const province of provinces) {
        for (
          let page = 1;
          page <= province.numberOfPages;
          page += concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page < province.numberOfPages) {
            for (let pIndex = 0; pIndex < concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }
          await Promise.all(jobs);
          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          // Update progress
          this.updateCrawlingProgress(
            province.name,
            page + concurrentPages - 1,
          );
        }
      }
    } catch (error) {
      console.error('Error during crawling:', error);
    }
  }

  // Method to crawl only N first pages of each province
  public async crawlFirstNPages(pagesCount: number) {
    try {
      const provinces = await this.getProvinceData();

      for (const province of provinces) {
        const maxPage = Math.min(pagesCount, province.numberOfPages);
        console.log(
          `Crawling first ${maxPage} pages of province ${province.name}`,
        );

        for (let page = 1; page <= maxPage; page += concurrentPages) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page + 1 <= maxPage) {
            for (let pIndex = 0; pIndex < concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }
          await Promise.all(jobs);
          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          this.updateCrawlingProgress(
            province.name,
            page + concurrentPages - 1,
          );
        }
      }
      return true;
    } catch (error) {
      console.error('Error during partial crawling:', error);
      return false;
    }
  }

  // Method to crawl specific province
  public async crawlProvince(provinceName: string) {
    try {
      const provinces = await this.getProvinceData();
      const province = provinces.find((p) => p.name === provinceName);

      if (!province) {
        throw new Error(`Province ${provinceName} not found`);
      }

      for (
        let page = 1;
        page <= province.numberOfPages;
        page += concurrentPages
      ) {
        const beg = new Date();
        const jobs = [this.crawlPage(province, page)];
        if (page < province.numberOfPages) {
          for (let pIndex = 0; pIndex < concurrentPages; pIndex++) {
            jobs.push(this.crawlPage(province, page + pIndex));
          }
        }
        await Promise.all(jobs);
        const end = new Date();
        const time = end.getTime() - beg.getTime();
        console.log(
          `Crawled page ${page} of province ${province.name} in ${time} ms`,
        );
        this.updateCrawlingProgress(province.name, page + concurrentPages - 1);
      }
      return true;
    } catch (error) {
      console.error(`Error crawling province ${provinceName}:`, error);
      return false;
    }
  }

  // Resume crawling from where it left off
  public async resumeCrawling() {
    try {
      const provinces = await this.getProvinceData();

      for (const province of provinces) {
        // Get the last crawled page from progress
        const startPage =
          (this.crawlingProgress[province.name]?.lastPage || 0) + 1;

        if (startPage > province.numberOfPages) {
          console.log(
            `Province ${province.name} already fully crawled, skipping`,
          );
          continue;
        }

        console.log(
          `Resuming crawl for ${province.name} from page ${startPage}`,
        );

        for (
          let page = startPage;
          page <= province.numberOfPages;
          page += concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page < province.numberOfPages) {
            for (let pIndex = 0; pIndex < concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }
          await Promise.all(jobs);
          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          this.updateCrawlingProgress(
            province.name,
            page + concurrentPages - 1,
          );
        }
      }
      return true;
    } catch (error) {
      console.error('Error during resume crawling:', error);
      return false;
    }
  }

  // Get crawling progress
  public getCrawlingProgress(): Record<
    string,
    { lastPage: number; lastUpdated: Date }
  > {
    return this.crawlingProgress;
  }

  // Update crawling progress
  protected updateCrawlingProgress(provinceName: string, page: number): void {
    this.crawlingProgress[provinceName] = {
      lastPage: page,
      lastUpdated: new Date(),
    };
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

    try {
      // Check if there are any companies extracted before proceeding
      if (companies.length === 0) {
        console.log(
          `No companies found on page ${page} of province ${province.name}`,
        );
        return;
      }

      // First check if any companies already exist
      const existingCompanies = await this.companyRepository.findBy({
        id: In(ids.filter((id) => id !== null && id !== undefined)),
      });

      // If there are existing companies, delete them first
      if (existingCompanies.length > 0) {
        await this.companyRepository.delete(
          existingCompanies.map((company) => company.id),
        );
        console.log(
          `Deleted ${existingCompanies.length} existing companies on page ${page} of province ${province.name}`,
        );
      }

      // Process companies to set foreign keys properly
      const validCompanies = companies.map((company) => {
        const processedCompany = { ...company };

        // Set foreign key IDs correctly instead of relation objects
        if (company.province) {
          processedCompany.provinceId = company.province.id;
          delete processedCompany.province;
        }

        if (company.district) {
          processedCompany.districtId = company.district.id;
          delete processedCompany.district;
        }

        if (company.ward) {
          processedCompany.wardId = company.ward.id;
          delete processedCompany.ward;
        }

        return processedCompany;
      });

      // Insert the extracted companies to database
      await this.companyRepository.save(validCompanies, {
        reload: false, // Don't reload entities after save to avoid relation loading issues
      });

      console.log(
        `Inserted ${validCompanies.length} companies on page ${page} of province ${province.name}`,
      );
    } catch (error) {
      console.error(
        `Database operation error on page ${page} of province ${province.name}:`,
        error,
      );
    }
  };
}
