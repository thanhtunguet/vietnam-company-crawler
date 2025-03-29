import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';
import { District } from './District';
import { Province } from './Province';

@Index('IX_Ward_DistrictId', ['districtId'], {})
@Index('IX_Ward_ProvinceId', ['provinceId'], {})
@Index('PK__Ward__3214EC07E7B250DE', ['id'], { unique: true })
@Index('UQ__Ward__A25C5AA7035685E2', ['code'], { unique: true })
@Entity('Ward', { schema: 'dbo' })
export class Ward {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('nvarchar', { name: 'Type', nullable: true, length: 500 })
  type: string | null;

  @Column('bigint', { name: 'DistrictId' })
  districtId: number;

  @Column('bigint', { name: 'ProvinceId' })
  provinceId: number;

  @Column('nvarchar', { name: 'EnglishName', nullable: true, length: 500 })
  englishName: string | null;

  @Column('nvarchar', { name: 'Slug', nullable: true, length: 255 })
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

  district: District;
}
