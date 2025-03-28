import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';
import { Province } from './Province';
import { Ward } from './Ward';

@Index('IX_District_ProvinceId', ['provinceId'], {})
@Index('PK__District__3214EC073A781117', ['id'], { unique: true })
@Index('UQ__District__A25C5AA75E498783', ['code'], { unique: true })
@Entity('District', { schema: 'dbo' })
export class District {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('varchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('varchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('varchar', { name: 'Type', nullable: true, length: 500 })
  type: string | null;

  @Column('bigint', { name: 'ProvinceId' })
  provinceId: number;

  @Column('varchar', { name: 'EnglishName', nullable: true, length: 500 })
  englishName: string | null;

  @Column('varchar', { name: 'Slug', nullable: true, length: 255 })
  slug: string | null;

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

  companies: Company[];

  province: Province;

  wards: Ward[];
}
