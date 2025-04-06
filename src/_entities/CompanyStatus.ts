import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './Company';

@Index('CompanyStatus_pk', ['id'], { unique: true })
@Entity('CompanyStatus', { schema: 'dbo' })
export class CompanyStatus {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'Id' })
  id: number;

  @Column('nvarchar', { name: 'Code', length: 100 })
  code: string;

  @Column('nvarchar', { name: 'Name', length: 100 })
  name: string;

  @Column('nvarchar', { name: 'EnglishName', nullable: true, length: 100 })
  englishName: string | null;

  @OneToMany(() => Company, (company) => company.status)
  companies?: Company[];
}
