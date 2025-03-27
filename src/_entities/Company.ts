import { Column, Entity, Index } from 'typeorm';
import { Business } from './Business';
import { District } from './District';
import { Province } from './Province';
import { Ward } from './Ward';

@Index('tax_code', ['taxCode'], { unique: true })
@Index('province_id', ['provinceId'], {})
@Index('district_id', ['districtId'], {})
@Index('ward_id', ['wardId'], {})
@Entity('company', { schema: 'NEW_TTDN' })
export class Company {
  @Column('bigint', { primary: true, name: 'id' })
  id: number;

  @Column('varchar', {
    name: 'tax_code',
    nullable: true,
    unique: true,
    length: 100,
  })
  taxCode: string | null;

  @Column('varchar', { name: 'name', nullable: true, length: 500 })
  name: string | null;

  @Column('text', { name: 'description', nullable: true })
  description: string | null;

  @Column('varchar', { name: 'representative', nullable: true, length: 500 })
  representative: string | null;

  @Column('varchar', { name: 'main_business', nullable: true, length: 500 })
  mainBusiness: string | null;

  @Column('varchar', { name: 'address', nullable: true, length: 500 })
  address: string | null;

  @Column('text', { name: 'formatted_address', nullable: true })
  formattedAddress: string | null;

  @Column('datetime', { name: 'issued_at', nullable: true })
  issuedAt: Date | null;

  @Column('varchar', { name: 'current_status', nullable: true, length: 500 })
  currentStatus: string | null;

  @Column('varchar', { name: 'alternate_name', nullable: true, length: 500 })
  alternateName: string | null;

  @Column('varchar', { name: 'slug', nullable: true, length: 2048 })
  slug: string | null;

  @Column('tinyint', { name: 'is_crawled_full', nullable: true, width: 1 })
  isCrawledFull: boolean | null;

  @Column('bigint', { name: 'province_id', nullable: true })
  provinceId: number | null;

  @Column('bigint', { name: 'district_id', nullable: true })
  districtId: number | null;

  @Column('bigint', { name: 'ward_id', nullable: true })
  wardId: number | null;

  @Column('bigint', { name: 'main_business_id', nullable: true })
  mainBusinessId: number | null;

  @Column('datetime', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('datetime', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Column('datetime', { name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  businesses: Business[];

  province: Province;

  district: District;

  ward: Ward;
}
