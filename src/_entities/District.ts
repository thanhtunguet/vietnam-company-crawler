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
import { Province } from './Province';
import { Ward } from './Ward';

@Index('District_Code_Unique', ['code'], { unique: true })
@Index('District_pk', ['id'], { unique: true })
@Entity('District', { schema: 'dbo' })
export class District {
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

  @OneToMany(() => Company, (company) => company.district)
  companies: Company[];

  @ManyToOne(() => Province, (province) => province.districts)
  @JoinColumn([{ name: 'ProvinceId', referencedColumnName: 'id' }])
  province: Province;

  @OneToMany(() => Ward, (ward) => ward.district)
  wards: Ward[];
}
