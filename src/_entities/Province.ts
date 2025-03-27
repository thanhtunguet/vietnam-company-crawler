import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';
import { District } from './District';
import { Ward } from './Ward';

@Index('code', ['code'], { unique: true })
@Entity('province', { schema: 'NEW_TTDN' })
export class Province {
  @Column('bigint', { primary: true, name: 'id' })
  id: number;

  @Column('varchar', { name: 'code', unique: true, length: 100 })
  code: string;

  @Column('varchar', { name: 'name', nullable: true, length: 500 })
  name: string | null;

  @Column('varchar', { name: 'type', nullable: true, length: 500 })
  type: string | null;

  @Column('varchar', { name: 'english_name', nullable: true, length: 500 })
  englishName: string | null;

  @Column('varchar', { name: 'slug', nullable: true, length: 255 })
  slug: string | null;

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

  companies: Company[];

  wards: Ward[];

  districts: District[];
}
