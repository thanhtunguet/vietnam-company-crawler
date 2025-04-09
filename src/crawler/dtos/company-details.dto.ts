import type { District, Province, Ward } from 'src/_entities';

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
