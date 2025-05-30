import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Business } from './Business.entity';
import { CompanyBusinessMapping } from './CompanyBusinessMapping.entity';
import { CompanyCrawlingLog } from './CompanyCrawlingLog.entity';
import { CompanyStatus } from './CompanyStatus.entity';
import { District } from './District.entity';
import { Province } from './Province.entity';
import { Ward } from './Ward.entity';

@Entity('Company')
export class Company {
  @PrimaryColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Name', length: 255 })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 100, unique: true })
  code: string;

  @Column('nvarchar', { name: 'EnglishName', length: 255, nullable: true })
  englishName: string;

  @Column('nvarchar', { name: 'Representative', length: 255, nullable: true })
  representative: string;

  @Column('nvarchar', {
    name: 'RepresentativePhoneNumber',
    length: 255,
    nullable: true,
  })
  representativePhoneNumber: string;

  @Column('nvarchar', { name: 'PhoneNumber', length: 255, nullable: true })
  phoneNumber: string;

  @Column('nvarchar', { name: 'Address', length: 500, nullable: true })
  address: string;

  @Column('nvarchar', { name: 'Description', length: 4000, nullable: true })
  description: string;

  @Column('datetime2', { name: 'IssuedAt', nullable: true })
  issuedAt: Date;

  @Column('datetime2', { name: 'TerminatedAt', nullable: true })
  terminatedAt: Date;

  @Column('bigint', { name: 'StatusId', nullable: true })
  statusId: number;

  @Column('bigint', { name: 'NumberOfStaffs', nullable: true })
  numberOfStaffs: number;

  @Column('nvarchar', { name: 'CurrentStatus', length: 255, nullable: true })
  currentStatus: string;

  @Column('nvarchar', { name: 'Director', length: 100, nullable: true })
  director: string;

  @Column('nvarchar', {
    name: 'DirectorPhoneNumber',
    length: 100,
    nullable: true,
  })
  directorPhoneNumber: string;

  @Column('datetime2', { name: 'CommencementDate', nullable: true })
  commencementDate: Date;

  @Column('datetime2', { name: 'AccountCreatedAt', nullable: true })
  accountCreatedAt: Date;

  @Column('nvarchar', { name: 'TaxAuthority', length: 100, nullable: true })
  taxAuthority: string;

  @Column('nvarchar', { name: 'Slug', length: 255, nullable: true })
  slug: string;

  @Column('datetime2', { name: 'CreatedAt', default: () => 'getdate()' })
  createdAt: Date;

  @Column('datetime2', { name: 'UpdatedAt', default: () => 'getdate()' })
  updatedAt: Date;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date;

  @Column('bigint', { name: 'ProvinceId', nullable: true })
  provinceId: number;

  @Column('bigint', { name: 'DistrictId', nullable: true })
  districtId: number;

  @Column('bigint', { name: 'WardId', nullable: true })
  wardId: number;

  // Relationships (defined in index.ts)
  status: CompanyStatus;
  businesses: Business[];
  businessMappings: CompanyBusinessMapping[];
  crawlingLog: CompanyCrawlingLog;

  // These relationships will be defined in index.ts
  @ManyToOne(() => Province, province => province.companies)
  @JoinColumn({ name: 'ProvinceId' })
  province: Province;

  @ManyToOne(() => District, district => district.companies)
  @JoinColumn({ name: 'DistrictId' })
  district: District;

  @ManyToOne(() => Ward, ward => ward.companies)
  @JoinColumn({ name: 'WardId' })
  ward: Ward;
}
