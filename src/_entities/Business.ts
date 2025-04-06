import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompanyBusinessMapping } from './CompanyBusinessMapping';

@Index('Business_Code_Unique', ['code'], { unique: true })
@Index('Business_pk', ['id'], { unique: true })
@Entity('Business', { schema: 'dbo' })
export class Business {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 10 })
  code: string;

  @Column('nvarchar', { name: 'RootCode', nullable: true, length: 10 })
  rootCode: string | null;

  @Column('nvarchar', { name: 'Name', length: 255 })
  name: string;

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

  @ManyToOne(() => Business, (business) => business.businesses)
  @JoinColumn([{ name: 'ParentId', referencedColumnName: 'id' }])
  parent: Business;

  @OneToMany(() => Business, (business) => business.parent)
  businesses: Business[];

  @OneToMany(
    () => CompanyBusinessMapping,
    (companyBusinessMapping) => companyBusinessMapping.business,
  )
  companyBusinessMappings: CompanyBusinessMapping[];
}
