import { Column, Entity, Index } from 'typeorm';
import { Company } from './Company';

@Index('PK__Business__3214EC079D1C5B27', ['id'], { unique: true })
@Index('UQ__Business__A25C5AA70C77E8C7', ['code'], { unique: true })
@Entity('Business', { schema: 'dbo' })
export class Business {
  @Column('bigint', { primary: true, name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', nullable: true, length: 500 })
  name: string | null;

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
}
