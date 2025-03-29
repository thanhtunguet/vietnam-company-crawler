import { Column, Entity, Index } from 'typeorm';
import { Business } from './Business';
import { District } from './District';
import { Province } from './Province';
import { Ward } from './Ward';

@Index('IX_Company_DistrictId', ['districtId'], {})
@Index('IX_Company_ProvinceId', ['provinceId'], {})
@Index('IX_Company_WardId', ['wardId'], {})
@Index('PK__Company__3214EC0768C5DFE4', ['id'], { unique: true })
@Index('UQ__Company__12945A285D205ACE', ['taxCode'], { unique: true })
@Entity('Company', { schema: 'dbo' })
export class Company {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('nvarchar', {
    name: 'TaxCode',
    nullable: true,
    unique: true,
    length: 100,
  })
  taxCode: string | null;

  @Column('nvarchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('nvarchar', { name: 'Description', nullable: true })
  description: string | null;

  @Column('nvarchar', { name: 'Representative', nullable: true, length: 500 })
  representative: string | null;

  @Column('nvarchar', { name: 'MainBusiness', nullable: true, length: 500 })
  mainBusiness: string | null;

  @Column('nvarchar', { name: 'Address', nullable: true, length: 500 })
  address: string | null;

  @Column('nvarchar', { name: 'FormattedAddress', nullable: true })
  formattedAddress: string | null;

  @Column('datetime2', { name: 'IssuedAt', nullable: true })
  issuedAt: Date | null;

  @Column('nvarchar', { name: 'CurrentStatus', nullable: true, length: 500 })
  currentStatus: string | null;

  @Column('nvarchar', { name: 'AlternateName', nullable: true, length: 500 })
  alternateName: string | null;

  @Column('nvarchar', { name: 'Slug', nullable: true, length: 2048 })
  slug: string | null;

  @Column('bit', { name: 'IsCrawledFull', nullable: true })
  isCrawledFull: boolean | null;

  @Column('bigint', { name: 'ProvinceId', nullable: true })
  provinceId: number | null;

  @Column('bigint', { name: 'DistrictId', nullable: true })
  districtId: number | null;

  @Column('bigint', { name: 'WardId', nullable: true })
  wardId: number | null;

  @Column('bigint', { name: 'MainBusinessId', nullable: true })
  mainBusinessId: number | null;

  @Column('datetime2', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  createdAt: Date | null;

  @Column('datetime2', {
    name: 'UpdatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  updatedAt: Date | null;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date | null;

  ward: Ward;

  province: Province;

  district: District;

  businesses: Business[];
}
