import { type Company } from 'src/_entities';
import { In, type Repository } from 'typeorm';
import type { CompanyDetails } from '../dtos/company-details.dto';
import type { ProvinceData } from '../dtos/province-data.dto';

export abstract class AbstractCrawlerAdapter {
  protected concurrentPages = 6;

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
          page += this.concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page < province.numberOfPages) {
            for (let pIndex = 0; pIndex < this.concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          // Update progress
          this.updateCrawlingProgress(
            province.name,
            page + this.concurrentPages - 1,
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

        for (let page = 1; page <= maxPage; page += this.concurrentPages) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page + 1 <= maxPage) {
            for (let pIndex = 0; pIndex < this.concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          this.updateCrawlingProgress(
            province.name,
            page + this.concurrentPages - 1,
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
        page += this.concurrentPages
      ) {
        const beg = new Date();
        const jobs = [this.crawlPage(province, page)];
        if (page < province.numberOfPages) {
          for (let pIndex = 0; pIndex < this.concurrentPages; pIndex++) {
            jobs.push(this.crawlPage(province, page + pIndex));
          }
        }

        try {
          await Promise.all(jobs);
        } catch (error) {
          console.error(
            `Error processing jobs for province ${province.name}, page ${page}:`,
            error,
          );
        }

        const end = new Date();
        const time = end.getTime() - beg.getTime();
        console.log(
          `Crawled page ${page} of province ${province.name} in ${time} ms`,
        );
        this.updateCrawlingProgress(
          province.name,
          page + this.concurrentPages - 1,
        );
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
          page += this.concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];
          if (page < province.numberOfPages) {
            for (let pIndex = 0; pIndex < this.concurrentPages; pIndex++) {
              jobs.push(this.crawlPage(province, page + pIndex));
            }
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} of province ${province.name} in ${time} ms`,
          );
          this.updateCrawlingProgress(
            province.name,
            page + this.concurrentPages - 1,
          );
        }
      }
      return true;
    } catch (error) {
      console.error('Error during resume crawling:', error);
      return false;
    }
  }

  // Crawl all provinces sorted by numberOfPages (ascending)
  public async crawlSmallestFirst() {
    try {
      // Get all province data
      const provinces = await this.getProvinceData();

      // Sort provinces by numberOfPages in ascending order
      const sortedProvinces = [...provinces].sort(
        (a, b) => a.numberOfPages - b.numberOfPages,
      );

      console.log('Province crawling order:');
      sortedProvinces.forEach((province, index) => {
        console.log(
          `${index + 1}. ${province.name} (${province.numberOfPages} pages)`,
        );
      });

      // Crawl each province in order
      for (const province of sortedProvinces) {
        console.log(
          `Starting to crawl province: ${province.name} with ${province.numberOfPages} pages`,
        );

        for (
          let page = 1;
          page <= province.numberOfPages;
          page += this.concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];

          const remainingPages = Math.min(
            this.concurrentPages - 1,
            province.numberOfPages - page,
          );

          for (let pIndex = 1; pIndex <= remainingPages; pIndex++) {
            jobs.push(this.crawlPage(province, page + pIndex));
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} to ${Math.min(
              page + this.concurrentPages - 1,
              province.numberOfPages,
            )} of province ${province.name} in ${time} ms`,
          );

          // Update progress
          this.updateCrawlingProgress(
            province.name,
            Math.min(page + this.concurrentPages - 1, province.numberOfPages),
          );
        }

        console.log(`✅ Completed crawling province: ${province.name}`);
      }

      console.log(
        '✅ Completed crawling all provinces from smallest to largest',
      );
      return true;
    } catch (error) {
      console.error('Error during crawling from smallest to largest:', error);
      return false;
    }
  }

  // Method to crawl only the last N pages of each province
  public async crawlLastNPages(pagesCount: number) {
    try {
      const provinces = await this.getProvinceData();

      for (const province of provinces) {
        if (province.numberOfPages <= 0) {
          console.log(`Province ${province.name} has no pages, skipping`);
          continue;
        }

        // Calculate start page from the end (last N pages)
        const startPage = Math.max(1, province.numberOfPages - pagesCount + 1);
        const pagesToCrawl = province.numberOfPages - startPage + 1;

        console.log(
          `Crawling last ${pagesToCrawl} pages (${startPage}-${province.numberOfPages}) of province ${province.name}`,
        );

        for (
          let page = startPage;
          page <= province.numberOfPages;
          page += this.concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];

          const remainingPages = Math.min(
            this.concurrentPages - 1,
            province.numberOfPages - page,
          );

          for (let pIndex = 1; pIndex <= remainingPages; pIndex++) {
            jobs.push(this.crawlPage(province, page + pIndex));
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();

          console.log(
            `Crawled page ${page} to ${Math.min(
              page + this.concurrentPages - 1,
              province.numberOfPages,
            )} of province ${province.name} in ${time} ms`,
          );

          this.updateCrawlingProgress(
            province.name,
            Math.min(page + this.concurrentPages - 1, province.numberOfPages),
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error crawling last pages:', error);
      return false;
    }
  }

  // Method to crawl a specific range of pages for each province
  public async crawlPageRange(fromPage: number, toPage: number) {
    try {
      const provinces = await this.getProvinceData();

      for (const province of provinces) {
        // Ensure page range is valid
        const validFromPage = Math.max(1, fromPage);
        const validToPage = Math.min(toPage, province.numberOfPages);

        if (validFromPage > validToPage) {
          console.log(
            `Invalid page range for province ${province.name}, skipping`,
          );
          continue;
        }

        console.log(
          `Crawling pages ${validFromPage} to ${validToPage} of province ${province.name}`,
        );

        for (
          let page = validFromPage;
          page <= validToPage;
          page += this.concurrentPages
        ) {
          const beg = new Date();
          const jobs = [this.crawlPage(province, page)];

          const remainingPages = Math.min(
            this.concurrentPages - 1,
            validToPage - page,
          );

          for (let pIndex = 1; pIndex <= remainingPages; pIndex++) {
            jobs.push(this.crawlPage(province, page + pIndex));
          }

          try {
            await Promise.all(jobs);
          } catch (error) {
            console.error(
              `Error processing jobs for province ${province.name}, page ${page}:`,
              error,
            );
          }

          const end = new Date();
          const time = end.getTime() - beg.getTime();
          console.log(
            `Crawled page ${page} to ${Math.min(
              page + this.concurrentPages - 1,
              validToPage,
            )} of province ${province.name} in ${time} ms`,
          );

          this.updateCrawlingProgress(
            province.name,
            Math.min(page + this.concurrentPages - 1, validToPage),
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error crawling page range:', error);
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
    try {
      const companiesOnPage = await this.extractCompaniesFromPage(
        province,
        page,
      );
      const companies = await Promise.all(
        companiesOnPage.map(async (company) => {
          try {
            return await this.extractCompanyDetails(company);
          } catch (error) {
            console.error(`Error extracting details for company:`, error);
            return null;
          }
        }),
      ).then((results) => results.filter(Boolean));

      const ids = companies.map((company) => company.id);

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
    } catch (error) {
      console.error(
        `Unexpected error crawling page ${page} of province ${province.name}:`,
        error,
      );
    }
  };
}
