import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './Company';
import { District } from './District';

@Index('Ward_Code_Unique', ['code'], { unique: true })
@Index('Ward_pk', ['id'], { unique: true })
@Entity('Ward', { schema: 'dbo' })
export class Ward {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', unique: true, length: 10 })
  code: string;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @Column('datetime2', {
    name: 'CreatedAt',
    nullable: true,
    default: () => 'getdate()',
  })
  createdAt: Date | null;

  @Column('datetime2', { name: 'UpdatedAt', nullable: true })
  updatedAt: Date | null;

  @Column('datetime2', { name: 'DeletedAt', nullable: true })
  deletedAt: Date | null;

  @Column('nvarchar', { name: 'EnglishName', nullable: true, length: 100 })
  englishName: string | null;

  @Column('nvarchar', { name: 'Slug', nullable: true, length: 100 })
  slug: string | null;

  @OneToMany(() => Company, (company) => company.ward)
  companies: Company[];

  @ManyToOne(() => District, (district) => district.wards)
  @JoinColumn([{ name: 'DistrictId', referencedColumnName: 'id' }])
  district: District;
}
