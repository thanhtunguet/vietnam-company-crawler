import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';

@Index('code', ['code'], { unique: true })
@Entity('business', { schema: 'NEW_TTDN' })
export class Business {
  @Column('bigint', { primary: true, name: 'id' })
  id: number;

  @Column('varchar', { name: 'code', unique: true, length: 100 })
  code: string;

  @Column('varchar', { name: 'name', nullable: true, length: 500 })
  name: string | null;

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
}
