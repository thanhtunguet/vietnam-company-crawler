import { CompanyStatus, CrawlingStatus, WebSource } from 'src/_entities';

export const infoDoanhNghiep = {
  id: 1,
  code: 'InfoDoanhNghiep',
  link: 'https://infodoanhnghiep.com',
  name: 'Info doanh nghiệp',
};

export const maSoThue = {
  id: 2,
  code: 'MaSoThue',
  link: 'https://masothue.com',
  name: 'Mã số thuế',
};

export const webSources: Partial<WebSource>[] = [infoDoanhNghiep, maSoThue];

export const companyStatus: Partial<CompanyStatus>[] = [
  {
    id: 1,
    code: 'active',
    name: 'Hoạt động',
  },
  {
    id: 2,
    code: 'inactive',
    name: 'Ngừng hoạt động',
  },
];

export const crawlingStatus: Partial<CrawlingStatus>[] = [
  {
    id: 1,
    code: 'pending',
    name: 'Chờ xử lý',
  },
  {
    id: 2,
    code: 'crawling',
    name: 'Đang xử lý',
  },
  {
    id: 3,
    code: 'done',
    name: 'Xử lý xong',
  },
  {
    id: 4,
    code: 'failed',
    name: 'Thất bại',
  },
];
