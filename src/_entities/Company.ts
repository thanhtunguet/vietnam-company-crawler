import { Column, Entity, Index, OneToMany } from 'typeorm';
import { CompanyBusinessMapping } from './CompanyBusinessMapping';

@Index('TaxCode', ['taxCode'], { unique: true })
@Index('Company_pk2', ['taxCode'], { unique: true })
@Index('Company_Id_TaxCode_Name_index', ['id', 'taxCode'], {})
@Entity('Company', { schema: 'TTDN' })
export class Company {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('varchar', {
    name: 'TaxCode',
    nullable: true,
    unique: true,
    length: 100,
  })
  taxCode: string | null;

  @Column('varchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('text', { name: 'Description', nullable: true })
  description: string | null;

  @Column('datetime', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('datetime', {
    name: 'UpdatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Column('datetime', { name: 'DeletedAt', nullable: true })
  deletedAt: Date | null;

  @Column('varchar', { name: 'Representative', nullable: true, length: 500 })
  representative: string | null;

  @Column('varchar', { name: 'MainBusiness', nullable: true, length: 500 })
  mainBusiness: string | null;

  @Column('varchar', { name: 'Address', nullable: true, length: 500 })
  address: string | null;

  @Column('datetime', { name: 'IssuedAt', nullable: true })
  issuedAt: Date | null;

  @Column('varchar', { name: 'CurrentStatus', nullable: true, length: 500 })
  currentStatus: string | null;

  @Column('varchar', { name: 'AlternateName', nullable: true, length: 500 })
  alternateName: string | null;

  @Column('bigint', { name: 'ProvinceId', nullable: true })
  provinceId: number | null;

  @Column('bigint', { name: 'DistrictId', nullable: true })
  districtId: number | null;

  @Column('bigint', { name: 'MainBusinessId', nullable: true })
  mainBusinessId: number | null;

  @Column('varchar', { name: 'Slug', nullable: true, length: 2048 })
  slug: string | null;

  @Column('bigint', { name: 'WardId', nullable: true })
  wardId: number | null;

  @Column('text', { name: 'FormattedAddress', nullable: true })
  formattedAddress: string | null;

  @Column('varchar', { name: 'ProvinceName', nullable: true, length: 255 })
  provinceName: string | null;

  @Column('varchar', { name: 'DistrictName', nullable: true, length: 255 })
  districtName: string | null;

  @Column('varchar', { name: 'WardName', nullable: true, length: 255 })
  wardName: string | null;

  @Column('tinyint', { name: 'IsCrawledFull', nullable: true, width: 1 })
  isCrawledFull: boolean | null;

  @OneToMany(
    () => CompanyBusinessMapping,
    (companyBusinessMapping) => companyBusinessMapping.company,
  )
  companyBusinessMappings: CompanyBusinessMapping[];
}
