import { District, Province, Ward } from 'src/_entities';

export class ProvinceData {
  name: string;

  link: string;

  numberOfPages: number;

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
  public abstract getProvinceData(): Promise<ProvinceData[]>;

  public abstract extractCompaniesFromPage(
    province: ProvinceData,
    page: number,
  ): Promise<Partial<CompanyDetails>[]>;

  public abstract extractCompanyDetails(
    companyDetails: Partial<CompanyDetails>,
  ): Promise<CompanyDetails>;
}
