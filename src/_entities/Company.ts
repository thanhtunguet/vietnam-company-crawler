import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Province } from './Province';
import { District } from './District';
import { Ward } from './Ward';
import { CompanyStatus } from './CompanyStatus';
import { CompanyBusinessMapping } from './CompanyBusinessMapping';
import { CompanyCrawlingLog } from './CompanyCrawlingLog';
import { Business } from './Business';

@Index('Company_Code_uindex', ['code'], { unique: true })
@Index('Company_Code_Unique', ['code'], { unique: true })
@Index('Company_pk', ['id'], { unique: true })
@Entity('Company', { schema: 'dbo' })
export class Company {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', length: 255 })
  name: string;

  @Column('nvarchar', { name: 'EnglishName', nullable: true, length: 255 })
  englishName: string | null;

  @Column('nvarchar', { name: 'Representative', nullable: true, length: 255 })
  representative: string | null;

  @Column('nvarchar', {
    name: 'RepresentativePhoneNumber',
    nullable: true,
    length: 255,
  })
  representativePhoneNumber: string | null;

  @Column('nvarchar', { name: 'PhoneNumber', nullable: true, length: 255 })
  phoneNumber: string | null;

  @Column('nvarchar', { name: 'Address', nullable: true, length: 500 })
  address: string | null;

  @Column('nvarchar', { name: 'Description', nullable: true, length: 4000 })
  description: string | null;

  @Column('datetime2', { name: 'IssuedAt', nullable: true })
  issuedAt: Date | null;

  @Column('datetime2', { name: 'TerminatedAt', nullable: true })
  terminatedAt: Date | null;

  @Column('bigint', { name: 'StatusId', nullable: true })
  statusId?: number;

  @Column('bigint', { name: 'NumberOfStaffs', nullable: true })
  numberOfStaffs: string | null;

  @Column('nvarchar', { name: 'CurrentStatus', nullable: true, length: 255 })
  currentStatus: string | null;

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

  @Column('nvarchar', { name: 'Director', nullable: true, length: 100 })
  director: string | null;

  @Column('nvarchar', {
    name: 'DirectorPhoneNumber',
    nullable: true,
    length: 100,
  })
  directorPhoneNumber: string | null;

  @Column('datetime2', { name: 'CommencementDate', nullable: true })
  commencementDate: Date | null;

  @Column('datetime2', { name: 'AccountCreatedAt', nullable: true })
  accountCreatedAt: Date | null;

  @Column('nvarchar', { name: 'TaxAuthority', nullable: true, length: 100 })
  taxAuthority: string | null;

  @Column('nvarchar', { name: 'Slug', nullable: true, length: 255 })
  slug: string | null;

  @ManyToOne(() => Province, (province) => province.companies)
  @JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])
  province: Province;

  @ManyToOne(() => District, (district) => district.companies)
  @JoinColumn([{ name: 'DistrictId', referencedColumnName: 'id' }])
  district: District;

  @ManyToOne(() => Ward, (ward) => ward.companies)
  @JoinColumn([{ name: 'WardId', referencedColumnName: 'id' }])
  ward: Ward;

  @ManyToOne(() => CompanyStatus, (companyStatus) => companyStatus.companies)
  @JoinColumn([{ name: 'StatusId', referencedColumnName: 'id' }])
  status: CompanyStatus;

  @OneToMany(
    () => CompanyBusinessMapping,
    (companyBusinessMapping) => companyBusinessMapping.company,
  )
  companyBusinessMappings: CompanyBusinessMapping[];

  @OneToMany(
    () => CompanyCrawlingLog,
    (companyCrawlingLog) => companyCrawlingLog.company,
  )
  companyCrawlingLogs: CompanyCrawlingLog[];

  businesses?: Business[];
}
