import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';
import { District } from './District';
import { Ward } from './Ward';

@Index('PK__Province__3214EC07D1C69C0F', ['id'], { unique: true })
@Index('UQ__Province__A25C5AA72316968A', ['code'], { unique: true })
@Entity('Province', { schema: 'dbo' })
export class Province {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('varchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('varchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

  @Column('varchar', { name: 'Type', nullable: true, length: 500 })
  type: string | null;

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

  districts: District[];

  wards: Ward[];
}
