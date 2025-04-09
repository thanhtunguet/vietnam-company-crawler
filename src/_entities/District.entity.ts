import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Company } from './Company.entity';
import { Province } from './Province.entity';
import { Ward } from './Ward.entity';

@Entity('District')
export class District {
  @PrimaryColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @Column('nvarchar', { name: 'Code', length: 10, unique: true })
  code: string;

  @Column('nvarchar', { name: 'EnglishName', length: 100, nullable: true })
  englishName: string;

  @Column('nvarchar', { name: 'Slug', length: 100, nullable: true })
  slug: string;

  @Column('bigint', { name: 'ProvinceId', nullable: true })
  provinceId: number;

  @Column('datetime2', { name: 'CreatedAt', default: () => 'getdate()' })
  createdAt: Date;

  @Column('datetime2', { name: 'UpdatedAt', nullable: true })
  updatedAt: Date;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date;

  // Relationships (defined in index.ts)
  province: Province;
  wards: Ward[];

  // This relationship will be defined in index.ts
  companies: Company[];
}
